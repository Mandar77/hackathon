'use client';

import { useOnboarding } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Step2Form from '@/components/onboarding/Step2Form';

export default function OnboardingStep2Page() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    onboardingData,
    formData,
    isSubmitting,
    loading,
    error,
    saveStep2
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

  // Redirect to step 1 if user hasn't completed it yet
  useEffect(() => {
    if (!loading && onboardingData && onboardingData.currentStep < 2) {
      router.push('/onboarding/step-1');
    }
  }, [onboardingData, loading, router]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading onboarding data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    router.push('/onboarding/step-3');
  };

  const handleBack = () => {
    router.push('/onboarding/step-1');
  };

  const handleSubmit = async (data: any) => {
    await saveStep2(data);
    // saveStep2 automatically moves to step 3, but we need to navigate
    handleNext();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Burnout Guard
          </h1>
          <p className="text-gray-600">
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
                    step <= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < 2 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Work Context</span>
            <span className="font-medium text-blue-600">AI Preferences</span>
            <span>Goals</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Step2Form
              initialData={formData}
              onSubmit={handleSubmit}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isSubmitting}
            />
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-100 rounded text-sm">
            <h3 className="font-bold mb-2">Debug Info - Step 2:</h3>
            <p>Current Page: /onboarding/step-2</p>
            <p>User ID: {user?.id}</p>
            <p>Onboarding Step: {onboardingData?.currentStep}</p>
            <p>Onboarding Complete: {onboardingData?.isComplete ? 'Yes' : 'No'}</p>
            <p>Form Data Keys: {Object.keys(formData).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}