'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { databaseService } from '@/lib/supabase/database-service';

export default function PostSignInRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState('Checking account status...');

  useEffect(() => {
    const handlePostSignIn = async () => {
      if (loading) return;
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        setChecking(true);
        setStatus('Setting up your account...');
        
        // Use your existing service
        const onboardingStatus = await databaseService.checkUserOnboardingStatus(user.id);
        
        if (!onboardingStatus.hasPreferences) {
          // Brand new user - create initial preferences
          setStatus('Creating your profile...');
          await databaseService.createInitialUserPreferences(user.id);
          router.push('/onboarding/step-1');
        } else if (!onboardingStatus.onboardingComplete) {
          // User has started onboarding but not finished
          setStatus('Resuming your setup...');
          const step = onboardingStatus.onboardingStep || 1;
          router.push(`/onboarding/step-${step}`);
        } else {
          // Returning user with complete onboarding
          setStatus('Welcome back!');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error during post-signin redirect:', error);
        setStatus('Setting up your account...');
        // Default to onboarding on error
        router.push('/onboarding/step1');
      } finally {
        setChecking(false);
      }
    };

    handlePostSignIn();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Burnout Guard!</h2>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    );
  }

  return null;
}