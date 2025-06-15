'use client';

import { useOnboarding } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingMainPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { onboardingData, loading } = useOnboarding();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Wait for onboarding data to load
    if (loading || authLoading) return;

    // If onboarding is complete, go to dashboard
    if (onboardingData?.isComplete) {
      router.push('/dashboard');
      return;
    }

    // Redirect to appropriate step based on onboarding progress
    const currentStep = onboardingData?.currentStep || 1;
    
    switch (currentStep) {
      case 1:
        router.push('/onboarding/step1');
        break;
      case 2:
        router.push('/onboarding/step2');
        break;
      case 3:
        router.push('/onboarding/step3');
        break;
      default:
        router.push('/onboarding/step1');
    }
  }, [user, authLoading, onboardingData, loading, router]);

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading onboarding...</p>
      </div>
    </div>
  );
}