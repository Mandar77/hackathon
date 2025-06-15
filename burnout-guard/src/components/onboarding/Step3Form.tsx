'use client';

import { useState } from 'react';
import { PRIMARY_GOALS } from '@/types/onboarding';

interface Step3FormProps {
  initialData: any;
  onSubmit: (data: any) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function Step3Form({ initialData, onSubmit, onComplete, onBack, isLoading }: Step3FormProps) {
  const [formData, setFormData] = useState({
    primary_goals: initialData?.primary_goals || [],
    specific_goals: initialData?.specific_goals || [],
    motivation_text: initialData?.motivation_text || '',
    biggest_challenges: initialData?.biggest_challenges || [],
    previous_burnout_experience: initialData?.previous_burnout_experience || false,
    burnout_severity: initialData?.burnout_severity || 3,
    success_metrics: initialData?.success_metrics || [],
    goal_timeline: initialData?.goal_timeline || '',
    commitment_level: initialData?.commitment_level || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      primary_goals: prev.primary_goals.includes(goalId)
        ? prev.primary_goals.filter((goal: string) => goal !== goalId)
        : [...prev.primary_goals, goalId]
    }));
  };

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      biggest_challenges: prev.biggest_challenges.includes(challenge)
        ? prev.biggest_challenges.filter((c: string) => c !== challenge)
        : [...prev.biggest_challenges, challenge]
    }));
  };

  const handleMetricToggle = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.includes(metric)
        ? prev.success_metrics.filter((m: string) => m !== metric)
        : [...prev.success_metrics, metric]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.primary_goals.length === 0) {
      newErrors.primary_goals = 'Please select at least one primary goal';
    }
    if (!formData.goal_timeline) {
      newErrors.goal_timeline = 'Please select a timeline for your goals';
    }
    if (!formData.commitment_level) {
      newErrors.commitment_level = 'Please indicate your commitment level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onComplete(); // Complete onboarding on success
    } catch (error) {
      console.error('Step 3 submission error:', error);
    }
  };

  const challenges = [
    'Heavy workload',
    'Long working hours',
    'Lack of work-life balance',
    'High stress levels',
    'Poor sleep quality',
    'Difficult colleagues/manager',
    'Unclear expectations',
    'Lack of recognition',
    'Job insecurity',
    'Repetitive tasks'
  ];

  const successMetrics = [
    'Better sleep quality',
    'Reduced stress levels',
    'More energy throughout the day',
    'Improved work satisfaction',
    'Better work-life boundaries',
    'Increased productivity',
    'Better relationships at work',
    'More time for hobbies/interests',
    'Improved physical health',
    'Better mood and mental health'
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Goals & Motivations
        </h2>
        <p className="text-gray-600">
          Help us understand what you want to achieve so we can create a personalized plan for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are your primary wellness goals? * (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIMARY_GOALS.map((goal) => (
              <label
                key={goal.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.primary_goals.includes(goal.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.primary_goals.includes(goal.id)}
                  onChange={() => handleGoalToggle(goal.id)}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{goal.icon}</span>
                <span className="font-medium text-gray-900">{goal.label}</span>
              </label>
            ))}
          </div>
          {errors.primary_goals && (
            <p className="mt-1 text-sm text-red-600">{errors.primary_goals}</p>
          )}
        </div>

        {/* Motivation Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What motivates you to improve your wellness? (Optional)
          </label>
          <textarea
            value={formData.motivation_text}
            onChange={(e) => handleInputChange('motivation_text', e.target.value)}
            placeholder="e.g., I want to have more energy for my family, feel less stressed at work..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Biggest Challenges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are your biggest workplace challenges? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {challenges.map((challenge) => (
              <label
                key={challenge}
                className={`flex items-center p-2 text-sm border rounded cursor-pointer transition-colors ${
                  formData.biggest_challenges.includes(challenge)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.biggest_challenges.includes(challenge)}
                  onChange={() => handleChallengeToggle(challenge)}
                  className="sr-only"
                />
                <span>{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Previous Burnout Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Have you experienced burnout before?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="previous_burnout_experience"
                value="true"
                checked={formData.previous_burnout_experience === true}
                onChange={() => handleInputChange('previous_burnout_experience', true)}
                className="mr-2"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"  
                name="previous_burnout_experience"
                value="false"
                checked={formData.previous_burnout_experience === false}
                onChange={() => handleInputChange('previous_burnout_experience', false)}
                className="mr-2"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Burnout Severity (if they've experienced it) */}
        {formData.previous_burnout_experience && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your stress/burnout level currently? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Low (1)</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.burnout_severity}
                onChange={(e) => handleInputChange('burnout_severity', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">High (10)</span>
              <span className="w-8 text-center font-medium">{formData.burnout_severity}</span>
            </div>
          </div>
        )}

        {/* Success Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How will you know you're making progress? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {successMetrics.map((metric) => (
              <label
                key={metric}
                className={`flex items-center p-2 text-sm border rounded cursor-pointer transition-colors ${
                  formData.success_metrics.includes(metric)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.success_metrics.includes(metric)}
                  onChange={() => handleMetricToggle(metric)}
                  className="sr-only"
                />
                <span>{metric}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Goal Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your timeline for achieving these goals? *
          </label>
          <select
            value={formData.goal_timeline}
            onChange={(e) => handleInputChange('goal_timeline', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.goal_timeline ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select timeline</option>
            <option value="1_month">1 month</option>
            <option value="3_months">3 months</option>
            <option value="6_months">6 months</option>
            <option value="1_year">1 year</option>
            <option value="ongoing">Ongoing commitment</option>
          </select>
          {errors.goal_timeline && (
            <p className="mt-1 text-sm text-red-600">{errors.goal_timeline}</p>
          )}
        </div>

        {/* Commitment Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How committed are you to making these changes? *
          </label>
          <select
            value={formData.commitment_level}
            onChange={(e) => handleInputChange('commitment_level', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.commitment_level ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select commitment level</option>
            <option value="very_high">Very High - I'm ready to make significant changes</option>
            <option value="high">High - I'm motivated and will put in effort</option>
            <option value="medium">Medium - I'll try but have some constraints</option>
            <option value="low">Low - Just exploring options for now</option>
          </select>
          {errors.commitment_level && (
            <p className="mt-1 text-sm text-red-600">{errors.commitment_level}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}