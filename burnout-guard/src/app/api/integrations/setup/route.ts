import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { databaseService } from '@/lib/supabase/database-service';

// Define types for better type safety
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[] | string;
  tokenUrl: string;
  authUrl: string;
}

interface ProviderConfig {
  [key: string]: OAuthConfig;
}

interface OAuthConfigs {
  [provider: string]: ProviderConfig;
}

// OAuth provider configurations
const OAUTH_CONFIGS: OAuthConfigs = {
  google: {
    calendar: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      tokenUrl: 'https://oauth2.googleapis.com/token',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
    }
  },
  microsoft: {
    calendar: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      scopes: ['https://graph.microsoft.com/calendars.read'],
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    }
  },
  fitbit: {
    watch: {
      clientId: process.env.FITBIT_CLIENT_ID!,
      clientSecret: process.env.FITBIT_CLIENT_SECRET!,
      scopes: ['activity', 'sleep', 'heartrate'],
      tokenUrl: 'https://api.fitbit.com/oauth2/token',
      authUrl: 'https://www.fitbit.com/oauth2/authorize'
    }
  },
  garmin: {
    watch: {
      clientId: process.env.GARMIN_CLIENT_ID!,
      clientSecret: process.env.GARMIN_CLIENT_SECRET!,
      scopes: ['activities:read', 'sleep:read'],
      tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
      authUrl: 'https://connectapi.garmin.com/oauth-service/oauth/authorize'
    }
  }
};

function getOAuthConfig(provider: string, integrationType: string): OAuthConfig | null {
  const providerConfig = OAUTH_CONFIGS[provider];
  if (!providerConfig) return null;
  
  const config = providerConfig[integrationType];
  return config || null;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration_type, provider, auth_code, redirect_uri } = await request.json();

    if (!integration_type || !provider) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const config = getOAuthConfig(provider, integration_type);
    if (!config) {
      return NextResponse.json({ 
        error: `Unsupported integration: ${provider} ${integration_type}` 
      }, { status: 400 });
    }

    // If no auth_code, return auth URL for OAuth flow
    if (!auth_code) {
      const authUrl = new URL(config.authUrl);
      authUrl.searchParams.append('client_id', config.clientId);
      authUrl.searchParams.append('redirect_uri', redirect_uri || `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/callback`);
      authUrl.searchParams.append('scope', Array.isArray(config.scopes) ? config.scopes.join(' ') : config.scopes);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('state', `${user.id}:${integration_type}:${provider}`);

      return NextResponse.json({
        success: true,
        auth_url: authUrl.toString(),
        requires_auth: true
      });
    }

    // Exchange auth code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: auth_code,
      redirect_uri: redirect_uri || `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/callback`
    });

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.json({ error: 'Failed to exchange auth code' }, { status: 400 });
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Invalid token response' }, { status: 400 });
    }

    // Store integration in database - Using YOUR Integration interface structure
    const integration = await databaseService.upsertIntegration({
      user_id: user.id,
      integration_type: integration_type as 'calendar' | 'watch' | 'email' | 'slack' | 'other',
      provider_name: provider, // This matches your interface (provider_name, not provider)
      status: 'connected' as 'connected' | 'disconnected' | 'error' | 'pending',
      connection_config: {
        // Store OAuth tokens and settings in connection_config
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : undefined,
        scopes: config.scopes,
        provider_user_id: tokens.user_id || null
      },
      last_sync_at: new Date().toISOString(),
      sync_frequency: 'daily' as 'real-time' | 'hourly' | 'daily' | 'manual',
      permissions_granted: Array.isArray(config.scopes) ? config.scopes : [config.scopes]
    });

    return NextResponse.json({
      success: true,
      integration,
      message: `${provider} ${integration_type} connected successfully`
    });

  } catch (error) {
    console.error('Integration setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const integrations = await databaseService.getIntegrations(user.id);
    const integrationHealth = await databaseService.checkIntegrationHealth(user.id);

    return NextResponse.json({
      success: true,
      data: {
        integrations,
        health: integrationHealth
      }
    });
  } catch (error) {
    console.error('Get integrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}