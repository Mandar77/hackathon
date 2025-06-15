import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { databaseService } from '@/lib/supabase/database-service';

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

    const { integration_type, provider } = await request.json();

    if (!integration_type || !provider) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await databaseService.updateIntegrationStatus(
      user.id,
      integration_type,
      provider,
      'disconnected'
    );

    return NextResponse.json({
      success: true,
      message: `${provider} ${integration_type} disconnected successfully`
    });
  } catch (error) {
    console.error('Integration disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}