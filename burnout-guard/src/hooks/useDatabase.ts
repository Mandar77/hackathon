// hooks/useDatabase.ts - React Hooks for Database Operations

import { useState, useEffect, useCallback, useRef } from 'react';
import { databaseService, DatabaseResult } from '@/lib/supabase/database-service';
import { 
  UserPreferences, 
  UserGoals, 
  WatchData, 
  CalendarData, 
  DailyWellnessScore, 
  AIIntervention,
  Integration,
  OnboardingFormState 
} from '@/types/onboarding';
import { useAuth } from './useAuth';

// Generic async hook
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

// Onboarding hooks
export function useOnboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<OnboardingFormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: onboardingData, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return null;
      return await databaseService.getCompleteOnboardingData(user.id);
    },
    [user?.id]
  );

  const saveStep1 = useCallback(async (step1Data: Partial<UserPreferences>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setIsSubmitting(true);
    try {
      const result = await databaseService.saveOnboardingStep1(user.id, step1Data);
      if (!result.success) throw result.error;
      
      setFormData(prev => ({ ...prev, ...step1Data }));
      setCurrentStep(2);
      return result.data;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  const saveStep2 = useCallback(async (step2Data: Partial<UserPreferences>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setIsSubmitting(true);
    try {
      const result = await databaseService.saveOnboardingStep2(user.id, step2Data);
      if (!result.success) throw result.error;
      
      setFormData(prev => ({ ...prev, ...step2Data }));
      setCurrentStep(3);
      return result.data;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  const saveStep3 = useCallback(async (step3Data: Partial<UserGoals>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setIsSubmitting(true);
    try {
      const result = await databaseService.saveOnboardingStep3(user.id, step3Data);
      if (!result.success) throw result.error;
      
      setFormData(prev => ({ ...prev, ...step3Data }));
      await refetch(); // Refresh onboarding data
      return result.data;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, refetch]);

  return {
    onboardingData,
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    isSubmitting,
    loading,
    error,
    saveStep1,
    saveStep2,
    saveStep3,
    refetch
  };
}

// Wellness data hooks
export function useWellnessData() {
  const { user } = useAuth();

  const { data: wellnessSummary, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return null;
      return await databaseService.getWellnessSummaryOptimized(user.id);
    },
    [user?.id]
  );

  const { data: trendAnalysis, loading: trendLoading } = useAsync(
    async () => {
      if (!user?.id) return null;
      return await databaseService.getTrendAnalysis(user.id, 30);
    },
    [user?.id]
  );

  // Real-time wellness score subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = databaseService.subscribeToWellnessScores(
      user.id,
      (newScore) => {
        // Trigger refetch when new score is available
        refetch();
      }
    );

    return () => {
      // If unsubscribe is async, just call it but don't await
      subscription.unsubscribe();
    };
  }, [user?.id, refetch]);

  return {
    wellnessSummary,
    trendAnalysis,
    loading: loading || trendLoading,
    error,
    refetch
  };
}

// Watch data hooks
export function useWatchData(days: number = 7) {
  const { user } = useAuth();

  const getDateRange = useCallback(() => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { startDate, endDate };
  }, [days]);

  const { data: watchData, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return [];
      const { startDate, endDate } = getDateRange();
      return await databaseService.getWatchData(user.id, startDate, endDate);
    },
    [user?.id, days]
  );

  const syncWatchData = useCallback(async (newWatchData: Partial<WatchData>[]) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const result = await databaseService.bulkSyncWatchData(user.id, newWatchData);
    if (!result.success) throw result.error;
    
    await refetch();
    return result.data;
  }, [user?.id, refetch]);

  return {
    watchData,
    loading,
    error,
    syncWatchData,
    refetch
  };
}

// Calendar data hooks
export function useCalendarData(days: number = 7) {
  const { user } = useAuth();

  const getDateRange = useCallback(() => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { startDate, endDate };
  }, [days]);

  const { data: calendarData, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return [];
      const { startDate, endDate } = getDateRange();
      return await databaseService.getCalendarData(user.id, startDate, endDate);
    },
    [user?.id, days]
  );

  const syncCalendarData = useCallback(async (newCalendarData: Partial<CalendarData>[]) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const result = await databaseService.batchUpsertCalendarData(newCalendarData);
    await refetch();
    return result;
  }, [user?.id, refetch]);

  return {
    calendarData,
    loading,
    error,
    syncCalendarData,
    refetch
  };
}

// AI Interventions hooks
export function useInterventions() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<AIIntervention[]>([]);

  const { data, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return [];
      return await databaseService.getAIInterventions(user.id, 20);
    },
    [user?.id]
  );

  // Real-time intervention subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = databaseService.subscribeToInterventions(
      user.id,
      (newIntervention) => {
        setInterventions(prev => [newIntervention, ...prev]);
      }
    );

    return () => {
        // If unsubscribe is async, just call it but don't await
        subscription.unsubscribe();
      };}, [user?.id]);

  // Update interventions when data changes
  useEffect(() => {
    if (data) {
      setInterventions(data);
    }
  }, [data]);

  const respondToIntervention = useCallback(async (
    interventionId: string,
    response: { status: string; user_response?: string; effectiveness_rating?: number }
  ) => {
    await databaseService.updateInterventionResponse(interventionId, response);
    await refetch();
  }, [refetch]);

  return {
    interventions,
    loading,
    error,
    respondToIntervention,
    refetch
  };
}

// Integrations hooks
export function useIntegrations() {
  const { user } = useAuth();

  const { data: integrations, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return [];
      return await databaseService.getIntegrations(user.id);
    },
    [user?.id]
  );

  const { data: integrationHealth, loading: healthLoading } = useAsync(
    async () => {
      if (!user?.id) return null;
      return await databaseService.checkIntegrationHealth(user.id);
    },
    [user?.id]
  );

  const setupIntegration = useCallback(async (
    integrationType: 'calendar' | 'watch' | 'email',
    provider: string,
    authCode?: string
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    // This would call your OAuth API endpoint
    const response = await fetch('/api/integrations/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integration_type: integrationType,
        provider,
        auth_code: authCode
      })
    });

    if (!response.ok) {
      throw new Error('Failed to setup integration');
    }

    const result = await response.json();
    await refetch();
    return result;
  }, [user?.id, refetch]);

  const disconnectIntegration = useCallback(async (
    integrationType: string,
    provider: string
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    await databaseService.updateIntegrationStatus(
      user.id,
      integrationType,
      provider,
      'disconnected'
    );
    
    await refetch();
  }, [user?.id, refetch]);

  return {
    integrations,
    integrationHealth,
    loading: loading || healthLoading,
    error,
    setupIntegration,
    disconnectIntegration,
    refetch
  };
}

// Dashboard data hook
export function useDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, loading, error, refetch } = useAsync(
    async () => {
      if (!user?.id) return null;
      return await databaseService.getDashboardData(user.id);
    },
    [user?.id]
  );

  const { data: weeklyInsights, loading: insightsLoading } = useAsync(
    async () => {
      if (!user?.id) return null;
      return await databaseService.getWeeklyInsights(user.id);
    },
    [user?.id]
  );

  return {
    dashboardData,
    weeklyInsights,
    loading: loading || insightsLoading,
    error,
    refetch
  };
}

// Progress tracking hook
export function useProgress() {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState('');

  const startProgress = useCallback((initialMessage: string = 'Processing...') => {
    setProgress(0);
    setIsActive(true);
    setMessage(initialMessage);
  }, []);

  const updateProgress = useCallback((value: number, newMessage?: string) => {
    setProgress(Math.min(Math.max(value, 0), 100));
    if (newMessage) setMessage(newMessage);
  }, []);

  const completeProgress = useCallback((finalMessage: string = 'Complete!') => {
    setProgress(100);
    setMessage(finalMessage);
    setTimeout(() => {
      setIsActive(false);
      setProgress(0);
      setMessage('');
    }, 1000);
  }, []);

  const errorProgress = useCallback((errorMessage: string = 'Error occurred') => {
    setMessage(errorMessage);
    setTimeout(() => {
      setIsActive(false);
      setProgress(0);
      setMessage('');
    }, 2000);
  }, []);

  return {
    progress,
    isActive,
    message,
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress
  };
}

// Custom hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}