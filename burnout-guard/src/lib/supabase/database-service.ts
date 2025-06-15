
import { supabase } from '../supabase';
import { 
  UserPreferences, 
  UserGoals, 
  WatchData, 
  CalendarData, 
  DailyWellnessScore, 
  AIIntervention,
  Integration 
} from '@/types/onboarding';


export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export type DatabaseResult<T> = {
  data: T | null;
  error: DatabaseError | null;
  success: boolean;
};

export class EnhancedDatabaseService {
  
  // ==========================================
  // ENHANCED ERROR HANDLING
  // ==========================================
  
  private handleError(error: any, context: string): DatabaseError {
    console.error(`Database error in ${context}:`, error);
    
    return new DatabaseError(
      `Failed to ${context}: ${error.message}`,
      error.code,
      error.details
    );
  }

  private wrapResult<T>(data: T | null, error: any = null): DatabaseResult<T> {
    if (error) {
      return {
        data: null,
        error: error instanceof DatabaseError ? error : new DatabaseError(error.message),
        success: false
      };
    }
    
    return {
      data,
      error: null,
      success: true
    };
  }

  private wrapError<T>(error: any): DatabaseResult<T> {
    return {
      data: null,
      error: error instanceof DatabaseError ? error : new DatabaseError(error.message),
      success: false
    };
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      console.log('Getting user preferences for:', userId);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single()
  
      if (error) {
        console.error('Error getting user preferences:', error);
        throw this.handleError(error, 'get user preferences');
      }
      
      console.log('User preferences result:', data);
      return data; // Will be null if no rows found
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null; // Return null on error to prevent blocking onboarding
    }
  }

// Replace your createInitialUserPreferences method with this:

async createInitialUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    // Use UPSERT to handle both create and update cases automatically
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        
        // Required fields from your schema
        job_role: 'Not specified', // Required field
        communication_style: 'supportive', // Required field - default to supportive
        intervention_frequency: 'medium', // Required field - default to medium
        focus_areas: [], // Required field - empty array
        
        // Onboarding tracking
        onboarding_step: 1,
        onboarding_complete: false,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Create initial preferences error:', error);
      throw this.handleError(error, 'create initial user preferences');
    }
    
    console.log('✅ Initial preferences created/updated successfully');
    return data;
  } catch (error) {
    console.error('Error creating initial user preferences:', error);
    return null;
  }
}

async checkUserOnboardingStatus(userId: string): Promise<{
  hasPreferences: boolean;
  onboardingComplete: boolean;
  onboardingStep: number;
  preferences: UserPreferences | null;
}> {
  try {
    const preferences = await this.getUserPreferences(userId);
    
    return {
      hasPreferences: !!preferences,
      onboardingComplete: preferences?.onboarding_complete || false,
      onboardingStep: preferences?.onboarding_step || 1,
      preferences
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      hasPreferences: false,
      onboardingComplete: false,
      onboardingStep: 1,
      preferences: null
    };
  }
}

async getUserGoals(userId: string): Promise<UserGoals | null> {
  try {
    console.log('Getting user goals for:', userId);
    
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single()

    if (error) {
      console.error('Error getting user goals:', error);
      throw this.handleError(error, 'get user goals');
    }
    
    console.log('User goals result:', data);
    return data; // Will be null if no rows found (normal during onboarding)
  } catch (error) {
    console.error('Error getting user goals:', error);
    return null; // Return null on error to prevent blocking onboarding
  }
}

  async getDailyWellnessScores(userId: string, startDate?: string): Promise<DailyWellnessScore[]> {
    try {
      let query = supabase
        .from('daily_wellness_scores')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }

      const { data, error } = await query;

      if (error) throw this.handleError(error, 'get daily wellness scores');
      return data || [];
    } catch (error) {
      console.error('Error getting wellness scores:', error);
      return [];
    }
  }

  async getIntegrations(userId: string): Promise<Integration[]> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId);

      if (error) throw this.handleError(error, 'get integrations');
      return data || [];
    } catch (error) {
      console.error('Error getting integrations:', error);
      return [];
    }
  }

  async getWellnessSummary(userId: string): Promise<{
    currentScore: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  }> {
    try {
      const scores = await this.getDailyWellnessScores(userId);
      
      if (scores.length === 0) {
        return {
          currentScore: 50,
          trend: 'stable',
          recommendations: ['Start tracking your wellness data']
        };
      }

      const currentScore = scores[0]?.overall_wellness_score || 50;
      const previousScore = scores[1]?.overall_wellness_score || currentScore;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (currentScore > previousScore + 5) trend = 'up';
      if (currentScore < previousScore - 5) trend = 'down';

      return {
        currentScore,
        trend,
        recommendations: scores[0]?.recommendations || []
      };
    } catch (error) {
      console.error('Error getting wellness summary:', error);
      return {
        currentScore: 50,
        trend: 'stable',
        recommendations: ['Error loading wellness data']
      };
    }
  }

  async upsertWatchData(watchData: Partial<WatchData>): Promise<WatchData | null> {
    try {
      const { data, error } = await supabase
        .from('watch_data')
        .upsert(watchData, { 
          onConflict: 'user_id,date' 
        })
        .select()
        .single();

      if (error) throw this.handleError(error, 'upsert watch data');
      return data;
    } catch (error) {
      console.error('Error upserting watch data:', error);
      return null;
    }
  }

  async batchUpsertWatchData(watchDataArray: Partial<WatchData>[]): Promise<WatchData[]> {
    try {
      const { data, error } = await supabase
        .from('watch_data')
        .upsert(watchDataArray, { 
          onConflict: 'user_id,date' 
        })
        .select();

      if (error) throw this.handleError(error, 'batch upsert watch data');
      return data || [];
    } catch (error) {
      console.error('Error batch upserting watch data:', error);
      return [];
    }
  }

  // ==========================================
  // ENHANCED ONBOARDING WITH TRANSACTIONS
  // ==========================================

  async saveOnboardingStep1(
    userId: string, 
    step1Data: Partial<UserPreferences>
  ): Promise<DatabaseResult<UserPreferences>> {
    try {
      // Get existing preferences (might be null for new users)
      const existingPreferences = await this.getUserPreferences(userId);
      
      const preferences = {
        ...existingPreferences, // Preserve any existing data
        ...step1Data,           // Add new step 1 data
        user_id: userId,
        onboarding_step: Math.max(step1Data.onboarding_step || 0, 1),
        updated_at: new Date().toISOString()
      };
  
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferences, { onConflict: 'user_id' })
        .select()
        .single();
  
      if (error) throw this.handleError(error, 'save onboarding step 1');
  
      return this.wrapResult(data);
    } catch (error) {
      return this.wrapError(error);
    }
  }

  async saveOnboardingStep2(
    userId: string, 
    step2Data: Partial<UserPreferences>
  ): Promise<DatabaseResult<UserPreferences>> {
    try {
      // First, get existing preferences to preserve step 1 data
      const existingPreferences = await this.getUserPreferences(userId);
      
      const preferences = {
        ...existingPreferences, // Preserve existing data (including job_role from step 1)
        ...step2Data,           // Add new step 2 data
        user_id: userId,
        onboarding_step: Math.max(step2Data.onboarding_step || 0, 2),
        updated_at: new Date().toISOString()
      };
  
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferences, { onConflict: 'user_id' })
        .select()
        .single();
  
      if (error) throw this.handleError(error, 'save onboarding step 2');
  
      return this.wrapResult(data);
    } catch (error) {
      return this.wrapError(error);
    }
  }

  async saveOnboardingStep3(
    userId: string, 
    step3Data: Partial<UserGoals>
  ): Promise<DatabaseResult<{ preferences: UserPreferences; goals: UserGoals }>> {
    try {
      // Manual transaction approach since RPC might not exist
      const [goalsResult, preferencesResult] = await Promise.all([
        supabase
          .from('user_goals')
          .upsert({ ...step3Data, user_id: userId }, { onConflict: 'user_id' })
          .select()
          .single(),
        supabase
          .from('user_preferences')
          .update({ onboarding_complete: true, onboarding_step: 3 })
          .eq('user_id', userId)
          .select()
          .single()
      ]);

      if (goalsResult.error) throw this.handleError(goalsResult.error, 'save goals');
      if (preferencesResult.error) throw this.handleError(preferencesResult.error, 'complete onboarding');

      return this.wrapResult({
        goals: goalsResult.data,
        preferences: preferencesResult.data
      });
    } catch (error) {
      return this.wrapError(error);
    }
  }

  // ==========================================
  // REAL-TIME SUBSCRIPTIONS
  // ==========================================

  subscribeToWellnessScores(
    userId: string, 
    callback: (score: DailyWellnessScore) => void
  ) {
    return supabase
      .channel(`wellness_scores_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_wellness_scores',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as DailyWellnessScore);
          }
        }
      )
      .subscribe();
  }

  subscribeToInterventions(
    userId: string, 
    callback: (intervention: AIIntervention) => void
  ) {
    return supabase
      .channel(`interventions_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_interventions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as AIIntervention);
        }
      )
      .subscribe();
  }

  // ==========================================
  // CACHING & PERFORMANCE OPTIMIZATIONS
  // ==========================================

  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}_${JSON.stringify(args)}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  async getWellnessSummaryOptimized(userId: string) {
    const cacheKey = this.getCacheKey('wellness_summary', userId);
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;

    const result = await this.getWellnessSummary(userId);
    this.setCachedData(cacheKey, result, 10); // Cache for 10 minutes
    
    return result;
  }

  // ==========================================
  // DATA VALIDATION & SANITIZATION
  // ==========================================

  private validateWatchData(data: Partial<WatchData>): Partial<WatchData> {
    const validated: Partial<WatchData> = { ...data };

    // Validate sleep duration (0-12 hours)
    if (validated.sleep_duration_minutes !== undefined) {
      validated.sleep_duration_minutes = Math.max(0, Math.min(validated.sleep_duration_minutes, 720));
    }

    // Validate heart rate (40-200 bpm)
    if (validated.resting_heart_rate !== undefined) {
      validated.resting_heart_rate = validated.resting_heart_rate > 40 && validated.resting_heart_rate < 200 
        ? validated.resting_heart_rate 
        : undefined;
    }

    // Validate steps (0-100k)
    if (validated.steps !== undefined) {
      validated.steps = Math.max(0, Math.min(validated.steps, 100000));
    }

    // Validate percentages and scores (0-100)
    const percentageFields = ['sleep_efficiency_percentage', 'stress_score', 'recovery_score', 'readiness_score'];
    percentageFields.forEach(field => {
      const value = validated[field as keyof WatchData] as number;
      if (value !== undefined) {
        (validated as any)[field] = Math.max(0, Math.min(value, 100));
      }
    });

    return validated;
  }

  async upsertWatchDataValidated(watchData: Partial<WatchData>): Promise<DatabaseResult<WatchData>> {
    try {
      const validatedData = this.validateWatchData(watchData);
      const result = await this.upsertWatchData(validatedData);
      return this.wrapResult(result);
    } catch (error) {
      return this.wrapError(error);
    }
  }

  // ==========================================
  // HEALTH CHECKS & MAINTENANCE
  // ==========================================

  async performHealthCheck(): Promise<{
    database: boolean;
    auth: boolean;
    rls: boolean;
  }> {
    try {
      // Test database connection
      const { error: dbError } = await supabase.from('user_preferences').select('id').limit(1);
      
      // Test auth
      const { error: authError } = await supabase.auth.getUser();
      
      // Test RLS (should fail without user context)
      const { error: rlsError } = await supabase.from('user_preferences').select('*').limit(1);
      
      return {
        database: !dbError,
        auth: !authError,
        rls: !!rlsError // RLS should block this query
      };
    } catch {
      return {
        database: false,
        auth: false,
        rls: false
      };
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // ADD these functions to your existing database-enhanced.ts file

// ==========================================
// MISSING FUNCTIONS FOR HOOKS
// ==========================================

async getCompleteOnboardingData(userId: string) {
  try {
    const [preferences, goals] = await Promise.all([
      this.getUserPreferences(userId),
      this.getUserGoals(userId)
    ]);

    return {
      preferences,
      goals,
      isComplete: preferences?.onboarding_complete || false,
      currentStep: preferences?.onboarding_step || 0
    };
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return {
      preferences: null,
      goals: null,
      isComplete: false,
      currentStep: 0
    };
  }
}

async getTrendAnalysis(userId: string, days: number = 30): Promise<{
  sleepTrend: 'improving' | 'stable' | 'declining';
  stressTrend: 'improving' | 'stable' | 'declining';
  workloadTrend: 'improving' | 'stable' | 'declining';
  overallTrend: 'improving' | 'stable' | 'declining';
  insights: string[];
}> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const scores = await this.getDailyWellnessScores(userId, startDate);

    if (scores.length < 7) {
      return {
        sleepTrend: 'stable',
        stressTrend: 'stable', 
        workloadTrend: 'stable',
        overallTrend: 'stable',
        insights: ['Need more data for trend analysis']
      };
    }

    // Simple trend calculation
    const recent = scores.slice(0, 3).reduce((sum, s) => sum + (s.overall_wellness_score || 50), 0) / 3;
    const older = scores.slice(-3).reduce((sum, s) => sum + (s.overall_wellness_score || 50), 0) / 3;
    
    const getTrend = (recent: number, older: number) => {
      if (recent > older + 5) return 'improving';
      if (recent < older - 5) return 'declining';
      return 'stable';
    };

    return {
      sleepTrend: getTrend(recent, older),
      stressTrend: getTrend(recent, older),
      workloadTrend: getTrend(recent, older),
      overallTrend: getTrend(recent, older),
      insights: ['Based on recent wellness scores']
    };
  } catch (error) {
    console.error('Error getting trend analysis:', error);
    return {
      sleepTrend: 'stable',
      stressTrend: 'stable',
      workloadTrend: 'stable',
      overallTrend: 'stable',
      insights: ['Error analyzing trends']
    };
  }
}

async getWatchData(userId: string, startDate?: string, endDate?: string): Promise<WatchData[]> {
  try {
    let query = supabase
      .from('watch_data')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw this.handleError(error, 'get watch data');
    return data || [];
  } catch (error) {
    console.error('Error getting watch data:', error);
    return [];
  }
}

async getCalendarData(userId: string, startDate?: string, endDate?: string): Promise<CalendarData[]> {
  try {
    let query = supabase
      .from('calendar_data')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) throw this.handleError(error, 'get calendar data');
    return data || [];
  } catch (error) {
    console.error('Error getting calendar data:', error);
    return [];
  }
}

async getAIInterventions(userId: string, limit: number = 50): Promise<AIIntervention[]> {
  try {
    const { data, error } = await supabase
      .from('ai_interventions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw this.handleError(error, 'get AI interventions');
    return data || [];
  } catch (error) {
    console.error('Error getting AI interventions:', error);
    return [];
  }
}

async createAIIntervention(intervention: Partial<AIIntervention>): Promise<AIIntervention | null> {
  try {
    const { data, error } = await supabase
      .from('ai_interventions')
      .insert(intervention)
      .select()
      .single();

    if (error) throw this.handleError(error, 'create AI intervention');
    return data;
  } catch (error) {
    console.error('Error creating AI intervention:', error);
    return null;
  }
}

async updateInterventionResponse(
  interventionId: string, 
  response: { user_response?: string; effectiveness_rating?: number }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_interventions')
      .update({
        ...response,
        delivered_at: new Date().toISOString()
      })
      .eq('id', interventionId);

    if (error) throw this.handleError(error, 'update intervention response');
  } catch (error) {
    console.error('Error updating intervention response:', error);
  }
}

async checkIntegrationHealth(userId: string): Promise<{
  calendar: { healthy: boolean; lastSync: string | null; error?: string };
  watch: { healthy: boolean; lastSync: string | null; error?: string };
}> {
  try {
    const integrations = await this.getIntegrations(userId);
    
    const calendarIntegration = integrations.find(i => i.integration_type === 'calendar');
    const watchIntegration = integrations.find(i => i.integration_type === 'watch');

    const isHealthy = (integration: Integration | undefined): boolean => {
      if (!integration || integration.status !== 'connected') return false;
      
      const lastSync = integration.last_sync_at;
      if (!lastSync) return false;
      
      const hoursSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
      return hoursSinceSync < 24;
    };

    return {
      calendar: {
        healthy: isHealthy(calendarIntegration),
        lastSync: calendarIntegration?.last_sync_at || null,
        error: calendarIntegration?.last_sync_error
      },
      watch: {
        healthy: isHealthy(watchIntegration),
        lastSync: watchIntegration?.last_sync_at || null,
        error: watchIntegration?.last_sync_error
      }
    };
  } catch (error) {
    console.error('Error checking integration health:', error);
    return {
      calendar: { healthy: false, lastSync: null },
      watch: { healthy: false, lastSync: null }
    };
  }
}

async getDashboardData(userId: string) {
  try {
    const [
      onboardingData,
      wellnessSummary,
      recentInterventions,
      integrations
    ] = await Promise.all([
      this.getCompleteOnboardingData(userId),
      this.getWellnessSummaryOptimized(userId),
      this.getAIInterventions(userId, 10),
      this.getIntegrations(userId)
    ]);

    return {
      onboarding: onboardingData,
      wellness: wellnessSummary,
      interventions: recentInterventions,
      integrations: integrations,
      isSetupComplete: onboardingData.isComplete && integrations.length > 0
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return {
      onboarding: { preferences: null, goals: null, isComplete: false, currentStep: 0 },
      wellness: { currentScore: 50, trend: 'stable' as const, recommendations: [] },
      interventions: [],
      integrations: [],
      isSetupComplete: false
    };
  }
}

async getWeeklyInsights(userId: string) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const [watchData, calendarData, wellnessScores] = await Promise.all([
      this.getWatchData(userId, sevenDaysAgo, today),
      this.getCalendarData(userId, sevenDaysAgo, today),
      this.getDailyWellnessScores(userId, sevenDaysAgo)
    ]);

    return {
      watchData,
      calendarData,
      wellnessScores,
      dateRange: { start: sevenDaysAgo, end: today }
    };
  } catch (error) {
    console.error('Error getting weekly insights:', error);
    return {
      watchData: [],
      calendarData: [],
      wellnessScores: [],
      dateRange: { start: '', end: '' }
    };
  }
}

async bulkSyncWatchData(
  userId: string, 
  watchDataArray: Partial<WatchData>[],
  onProgress?: (completed: number, total: number) => void
): Promise<DatabaseResult<WatchData[]>> {
  try {
    const batchSize = 50;
    const results: WatchData[] = [];
    
    for (let i = 0; i < watchDataArray.length; i += batchSize) {
      const batch = watchDataArray.slice(i, i + batchSize);
      const validatedBatch = batch.map(data => this.validateWatchData({ ...data, user_id: userId }));
      
      const batchResults = await this.batchUpsertWatchData(validatedBatch);
      results.push(...batchResults);
      
      if (onProgress) {
        onProgress(Math.min(i + batchSize, watchDataArray.length), watchDataArray.length);
      }
    }

    return this.wrapResult(results);
  } catch (error) {
    return this.wrapError(error);
  }
}

async batchUpsertCalendarData(calendarDataArray: Partial<CalendarData>[]): Promise<CalendarData[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_data')
      .upsert(calendarDataArray, {
        onConflict: 'user_id,event_id'
      })
      .select();

    if (error) throw this.handleError(error, 'batch upsert calendar data');
    return data || [];
  } catch (error) {
    console.error('Error batch upserting calendar data:', error);
    return [];
  }
}

// ==========================================
// ADDITIONAL MISSING FUNCTIONS
// ==========================================

async upsertIntegration(integration: Partial<Integration>): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .upsert(integration, {
        onConflict: 'user_id,integration_type,provider_name'
      })
      .select()
      .single();

    if (error) throw this.handleError(error, 'upsert integration');
    return data;
  } catch (error) {
    console.error('Error upserting integration:', error);
    return null;
  }
}

async updateIntegrationStatus(
  userId: string, 
  integrationType: string, 
  provider: string, 
  status: string,
  errorMessage?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      last_sync_at: new Date().toISOString()
    };

    if (errorMessage) {
      updateData.last_sync_error = errorMessage;
    }

    const { error } = await supabase
      .from('integrations')
      .update(updateData)
      .eq('user_id', userId)
      .eq('integration_type', integrationType)
      .eq('provider_name', provider);

    if (error) throw this.handleError(error, 'update integration status');
  } catch (error) {
    console.error('Error updating integration status:', error);
    throw error;
  }
}

async isOnboardingComplete(userId: string): Promise<boolean> {
  try {
    const preferences = await this.getUserPreferences(userId);
    return preferences?.onboarding_complete || false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

async completeOnboarding(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .update({
        onboarding_complete: true,
        onboarding_step: 3
      })
      .eq('user_id', userId);

    if (error) throw this.handleError(error, 'complete onboarding');
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

async getLatestWatchMetrics(userId: string): Promise<WatchData | null> {
  try {
    const { data, error } = await supabase
      .from('watch_data')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw this.handleError(error, 'get latest watch metrics');
    }

    return data;
  } catch (error) {
    console.error('Error getting latest watch metrics:', error);
    return null;
  }
}

async getLatestCalendarMetrics(userId: string): Promise<CalendarData | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_data')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw this.handleError(error, 'get latest calendar metrics');
    }

    return data;
  } catch (error) {
    console.error('Error getting latest calendar metrics:', error);
    return null;
  }
}

async upsertDailyWellnessScore(score: Partial<DailyWellnessScore>): Promise<DailyWellnessScore | null> {
  try {
    const { data, error } = await supabase
      .from('daily_wellness_scores')
      .upsert(score, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) throw this.handleError(error, 'upsert daily wellness score');
    return data;
  } catch (error) {
    console.error('Error upserting wellness score:', error);
    return null;
  }
}

async calculateWellnessScore(userId: string, date: string): Promise<number | null> {
  try {
    // Since we might not have the database function, let's calculate it here
    const [watchData, calendarData] = await Promise.all([
      this.getWatchData(userId, date, date),
      this.getCalendarData(userId, date, date)
    ]);

    if (watchData.length === 0 && calendarData.length === 0) {
      return null;
    }

    // Simple scoring algorithm
    let score = 50; // Base score

    // Watch data scoring
    if (watchData.length > 0) {
      const watch = watchData[0];
      
      // Sleep scoring (30% weight)
      if (watch.sleep_efficiency_percentage) {
        const sleepScore = Math.min(watch.sleep_efficiency_percentage, 100);
        score += (sleepScore - 50) * 0.3;
      }
      
      // Stress scoring (25% weight) - lower stress is better
      if (watch.stress_score) {
        const stressScore = 100 - watch.stress_score; // Invert stress score
        score += (stressScore - 50) * 0.25;
      }
      
      // Recovery scoring (20% weight)
      if (watch.recovery_score) {
        score += (watch.recovery_score - 50) * 0.2;
      }
    }

    // Calendar data scoring (25% weight)
    if (calendarData.length > 0) {
      const totalMeetingTime = calendarData.reduce((sum, event) => sum + (event.work_duration_minutes || 0), 0);
      
      // Penalize excessive meeting time
      if (totalMeetingTime > 480) { // More than 8 hours
        score -= 20;
      } else if (totalMeetingTime > 300) { // More than 5 hours
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  } catch (error) {
    console.error('Error calculating wellness score:', error);
    return null;
  }
}

async getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

async cleanupOldData(userId: string, daysToKeep: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await Promise.all([
      supabase.from('watch_data').delete().eq('user_id', userId).lt('date', cutoffDate),
      supabase.from('calendar_data').delete().eq('user_id', userId).lt('start_time', cutoffDate),
      supabase.from('daily_wellness_scores').delete().eq('user_id', userId).lt('date', cutoffDate)
    ]);
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
}

}



// Singleton instance
export const databaseService = new EnhancedDatabaseService();