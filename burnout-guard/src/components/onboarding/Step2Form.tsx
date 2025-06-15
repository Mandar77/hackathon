'use client';

import { useState } from 'react';
import { FOCUS_AREAS } from '@/types/onboarding';

interface Step2FormProps {
  initialData: any;
  onSubmit: (data: any) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function Step2Form({ initialData, onSubmit, onNext, onBack, isLoading }: Step2FormProps) {
  const [formData, setFormData] = useState({
    communication_style: initialData?.communication_style || '',
    intervention_frequency: initialData?.intervention_frequency || '',
    focus_areas: initialData?.focus_areas || [],
    preferred_checkin_times: initialData?.preferred_checkin_times || [],
    notification_preferences: initialData?.notification_preferences || {
      email: true,
      push: false,
      sms: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFocusAreaToggle = (areaValue: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(areaValue)
        ? prev.focus_areas.filter((area: string) => area !== areaValue)
        : [...prev.focus_areas, areaValue]
    }));
  };

  const handleCheckinTimeToggle = (hour: number) => {
    setFormData(prev => ({
      ...prev,
      preferred_checkin_times: prev.preferred_checkin_times.includes(hour)
        ? prev.preferred_checkin_times.filter((time: number) => time !== hour)
        : [...prev.preferred_checkin_times, hour]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.communication_style) {
      newErrors.communication_style = 'Please select a communication style';
    }
    if (!formData.intervention_frequency) {
      newErrors.intervention_frequency = 'Please select intervention frequency';
    }
    if (formData.focus_areas.length === 0) {
      newErrors.focus_areas = 'Please select at least one focus area';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      //onNext(); // Move to next step on success
    } catch (error) {
      console.error('Step 2 submission error:', error);
    }
  };

  const checkinTimes = [
    { hour: 9, label: '9:00 AM' },
    { hour: 12, label: '12:00 PM' },
    { hour: 15, label: '3:00 PM' },
    { hour: 18, label: '6:00 PM' },
    { hour: 21, label: '9:00 PM' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Assistant Preferences
        </h2>
        <p className="text-gray-600">
          Help us customize how our AI assistant will interact with you and support your wellness.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Communication Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred communication style *
          </label>
          <div className="space-y-2">
            {[
              { value: 'direct', label: 'Direct & Brief', desc: 'Get straight to the point' },
              { value: 'supportive', label: 'Supportive & Encouraging', desc: 'Positive reinforcement and motivation' },
              { value: 'analytical', label: 'Data-driven & Analytical', desc: 'Focus on metrics and insights' },
              { value: 'casual', label: 'Friendly & Conversational', desc: 'Relaxed, informal tone' }
            ].map((style) => (
              <label key={style.value} className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="communication_style"
                  value={style.value}
                  checked={formData.communication_style === style.value}
                  onChange={(e) => handleInputChange('communication_style', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.communication_style && (
            <p className="mt-1 text-sm text-red-600">{errors.communication_style}</p>
          )}
        </div>

        {/* Intervention Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How often would you like wellness check-ins? *
          </label>
          <select
            value={formData.intervention_frequency}
            onChange={(e) => handleInputChange('intervention_frequency', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.intervention_frequency ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select frequency</option>
            <option value="high">Multiple times per day</option>
            <option value="medium">Once per day</option>
            <option value="low">A few times per week</option>
            <option value="minimal">Only when needed</option>
          </select>
          {errors.intervention_frequency && (
            <p className="mt-1 text-sm text-red-600">{errors.intervention_frequency}</p>
          )}
        </div>

        {/* Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What areas would you like to focus on? * (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOCUS_AREAS.map((area) => (
              <label
                key={area.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.focus_areas.includes(area.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.focus_areas.includes(area.value)}
                  onChange={() => handleFocusAreaToggle(area.value)}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{area.icon}</span>
                <span className="font-medium text-gray-900">{area.label}</span>
              </label>
            ))}
          </div>
          {errors.focus_areas && (
            <p className="mt-1 text-sm text-red-600">{errors.focus_areas}</p>
          )}
        </div>

        {/* Preferred Check-in Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            When would you prefer wellness check-ins? (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {checkinTimes.map((time) => (
              <button
                key={time.hour}
                type="button"
                onClick={() => handleCheckinTimeToggle(time.hour)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.preferred_checkin_times.includes(time.hour)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Notification preferences
          </label>
          <div className="space-y-2">
            {[
              { key: 'email', label: 'Email notifications' },
              { key: 'push', label: 'Push notifications' },
              { key: 'sms', label: 'SMS notifications' }
            ].map((pref) => (
              <label key={pref.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notification_preferences[pref.key]}
                  onChange={(e) => handleInputChange('notification_preferences', {
                    ...formData.notification_preferences,
                    [pref.key]: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-gray-700">{pref.label}</span>
              </label>
            ))}
          </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}