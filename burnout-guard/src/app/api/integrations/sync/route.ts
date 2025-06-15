// src/app/api/integrations/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { databaseService } from '@/lib/supabase/database-service';

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
  organizer?: {
    email: string;
    self?: boolean;
  };
  recurringEventId?: string;
  location?: string;
  description?: string;
}

// Helper function to analyze calendar events into daily metrics
function analyzeCalendarEvents(events: GoogleCalendarEvent[], targetDate: string) {
  const dayEvents = events.filter(event => {
    const eventDate = event.start.dateTime ? 
      new Date(event.start.dateTime).toDateString() : 
      new Date(event.start.date!).toDateString();
    return eventDate === new Date(targetDate).toDateString();
  });

  let totalMeetingMinutes = 0;
  let meetingCount = 0;
  let backToBackMeetings = 0;
  let longestMeetingMinutes = 0;
  let oneOnOneCount = 0;
  let teamMeetingCount = 0;
  let externalMeetingCount = 0;
  
  const eventTimes: Array<{ start: Date; end: Date }> = [];
  
  dayEvents.forEach(event => {
    if (!event.start.dateTime || !event.end.dateTime) return; // Skip all-day events
    
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    totalMeetingMinutes += durationMinutes;
    meetingCount++;
    longestMeetingMinutes = Math.max(longestMeetingMinutes, durationMinutes);
    
    eventTimes.push({ start: startTime, end: endTime });
    
    // Categorize meeting types
    const attendeeCount = event.attendees?.length || 0;
    const hasExternalAttendees = event.attendees?.some(a => 
      !a.email.includes('@yourcompany.com') // Adjust this domain check
    );
    
    if (attendeeCount === 1) {
      oneOnOneCount++;
    } else if (attendeeCount > 1 && attendeeCount <= 5) {
      teamMeetingCount++;
    } else if (hasExternalAttendees) {
      externalMeetingCount++;
    }
  });
  
  // Calculate back-to-back meetings
  eventTimes.sort((a, b) => a.start.getTime() - b.start.getTime());
  for (let i = 0; i < eventTimes.length - 1; i++) {
    const currentEnd = eventTimes[i].end;
    const nextStart = eventTimes[i + 1].start;
    const gap = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
    if (gap <= 5) { // 5 minutes or less between meetings
      backToBackMeetings++;
    }
  }
  
  // Calculate focus blocks (gaps of 60+ minutes between meetings)
  let focusBlocksCount = 0;
  let longestFocusBlockMinutes = 0;
  let fragmentedTimeMinutes = 0;
  
  for (let i = 0; i < eventTimes.length - 1; i++) {
    const currentEnd = eventTimes[i].end;
    const nextStart = eventTimes[i + 1].start;
    const gap = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
    
    if (gap >= 60) {
      focusBlocksCount++;
      longestFocusBlockMinutes = Math.max(longestFocusBlockMinutes, gap);
    } else if (gap < 30 && gap > 5) {
      fragmentedTimeMinutes += gap;
    }
  }
  
  // Calculate work timing
  const firstEventTime = eventTimes.length > 0 ? 
    eventTimes[0].start.toTimeString().split(' ')[0] : undefined;
  const lastEventTime = eventTimes.length > 0 ? 
    eventTimes[eventTimes.length - 1].end.toTimeString().split(' ')[0] : undefined;
  
  const workDurationMinutes = eventTimes.length > 0 ? 
    (eventTimes[eventTimes.length - 1].end.getTime() - eventTimes[0].start.getTime()) / (1000 * 60) : 0;
  
  // Calculate after-hours work (before 8 AM or after 6 PM)
  let afterHoursMinutes = 0;
  eventTimes.forEach(({ start, end }) => {
    const startHour = start.getHours();
    const endHour = end.getHours();
    
    if (startHour < 8 || startHour >= 18) {
      afterHoursMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    }
  });
  
  return {
    total_meeting_minutes: Math.round(totalMeetingMinutes),
    meeting_count: meetingCount,
    back_to_back_meetings: backToBackMeetings,
    longest_meeting_minutes: Math.round(longestMeetingMinutes),
    first_event_time: firstEventTime,
    last_event_time: lastEventTime,
    work_duration_minutes: Math.round(workDurationMinutes),
    after_hours_minutes: Math.round(afterHoursMinutes),
    focus_blocks_count: focusBlocksCount,
    longest_focus_block_minutes: Math.round(longestFocusBlockMinutes),
    fragmented_time_minutes: Math.round(fragmentedTimeMinutes),
    one_on_one_count: oneOnOneCount,
    team_meeting_count: teamMeetingCount,
    external_meeting_count: externalMeetingCount,
    raw_events: dayEvents
  };
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

    const { integration_type, provider, days_back = 7 } = await request.json();

    if (integration_type !== 'calendar' || provider !== 'google') {
      return NextResponse.json({ error: 'Unsupported integration' }, { status: 400 });
    }

    // Get user's calendar integration
    const integrations = await databaseService.getIntegrations(user.id);
    const calendarIntegration = integrations.find(
      i => i.integration_type === 'calendar' && i.provider_name === 'google'
    );

    if (!calendarIntegration || calendarIntegration.status !== 'connected') {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const accessToken = calendarIntegration.connection_config?.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 });
    }

    // Fetch calendar events from Google
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - days_back);
    const timeMax = new Date();

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '1000'
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error('Google Calendar API error:', errorText);
      
      // Update integration status
      await databaseService.updateIntegrationStatus(
        user.id,
        'calendar',
        'google',
        'error',
        `API Error: ${calendarResponse.status}`
      );
      
      return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 400 });
    }

    const calendarData = await calendarResponse.json();
    const events: GoogleCalendarEvent[] = calendarData.items || [];

    // Process events into daily aggregates
    const processedDays: any[] = [];
    
    for (let i = 0; i < days_back; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateString = targetDate.toISOString().split('T')[0];
      
      const dayMetrics = analyzeCalendarEvents(events, dateString);
      
      // Store in database
      await databaseService.batchUpsertCalendarData([{
        user_id: user.id,
        date: dateString,
        ...dayMetrics
      }]);
      
      processedDays.push({
        date: dateString,
        ...dayMetrics
      });
    }

    // Update integration sync status
    await databaseService.updateIntegrationStatus(
      user.id,
      'calendar',
      'google',
      'connected'
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${processedDays.length} days of calendar data`,
      data: processedDays
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}