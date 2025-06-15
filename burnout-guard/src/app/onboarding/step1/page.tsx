'use client';

import { useOnboarding } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Step1Form from '@/components/onboarding/Step1Form';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { Card } from '@/components/ui/card';

export default function OnboardingStep1Page() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    onboardingData,
    formData,
    isSubmitting,
    loading,
    error,
    saveStep1
  } = useOnboarding();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Check if onboarding is already complete
  useEffect(() => {
    if (onboardingData?.isComplete) {
      router.push('/dashboard');
    }
  }, [onboardingData, router]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading onboarding data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    router.push('/onboarding/step2');
  };

  const handleSubmit = async (data: any) => {
    console.log('🟡 Step 1 form submitted with data:', data);
  
    try {
      console.log('🟡 Calling saveStep1...');
      const result = await saveStep1(data);
      console.log('🟡 SaveStep1 result:', result);
      
      console.log('🟡 Navigating to step 2...');
      router.push('/onboarding/step2');
      
    } catch (error) {
      console.error('❌ Step 1 submission error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <AuthHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome to Burnout Guard
          </h1>
          <p className="text-gray-600 text-lg">
            Let's set up your personalized wellness experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 1
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${step < 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="font-medium text-purple-600">Work Context</span>
            <span>AI Preferences</span>
            <span>Goals</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-xl p-8">
            <Step1Form
              initialData={formData}
              onSubmit={handleSubmit}
              onNext={handleNext}
              isLoading={isSubmitting}
            />
          </Card>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-100 rounded text-sm">
            <h3 className="font-bold mb-2">Debug Info - Step 1:</h3>
            <p>Current Page: /onboarding/step-1</p>
            <p>User ID: {user?.id}</p>
            <p>Onboarding Complete: {onboardingData?.isComplete ? 'Yes' : 'No'}</p>
            <p>Form Data Keys: {Object.keys(formData).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}