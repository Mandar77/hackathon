// src/app/api/integrations/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { databaseService } from '@/lib/supabase/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_error=missing_code_or_state`
      );
    }

    // Parse state to get user info
    const [userId, integrationType, provider] = state.split(':');
    if (!userId || !integrationType || !provider) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_error=invalid_state`
      );
    }

    // Verify user is authenticated
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
    if (authError || !user || user.id !== userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?integration_callback=true`
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_error=invalid_token_response`
      );
    }

    // Store integration in database
    await databaseService.upsertIntegration({
      user_id: userId,
      integration_type: integrationType as 'calendar' | 'watch' | 'email' | 'slack' | 'other',
      provider_name: provider,
      status: 'connected',
      connection_config: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in ? 
          new Date(Date.now() + tokens.expires_in * 1000).toISOString() : 
          undefined,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        provider_user_id: null
      },
      last_sync_at: new Date().toISOString(),
      sync_frequency: 'daily',
      permissions_granted: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    // Trigger initial sync
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          integration_type: integrationType,
          provider: provider
        })
      });
    } catch (syncError) {
      console.error('Initial sync failed:', syncError);
      // Don't fail the whole integration for sync errors
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_success=${provider}_${integrationType}`
    );

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?integration_error=callback_failed`
    );
  }
}