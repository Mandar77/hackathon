'use client';

import { useState } from 'react';
import { COMPANY_SIZES } from '@/types/onboarding';

interface Step1FormProps {
  initialData: any;
  onSubmit: (data: any) => Promise<void>;
  onNext: () => void;
  isLoading: boolean;
}

export default function Step1Form({ initialData, onSubmit, onNext, isLoading }: Step1FormProps) {
  const [formData, setFormData] = useState({
    job_role: initialData?.job_role || '',
    industry: initialData?.industry || '',
    company_size: initialData?.company_size || '',
    work_location: initialData?.work_location || '',
    working_hours_start: initialData?.working_hours_start || 9,
    working_hours_end: initialData?.working_hours_end || 17,
    team_size: initialData?.team_size || 1,
    work_autonomy: initialData?.work_autonomy || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.job_role.trim()) {
      newErrors.job_role = 'Job role is required';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.company_size) {
      newErrors.company_size = 'Company size is required';
    }
    if (!formData.work_location) {
      newErrors.work_location = 'Work location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onNext(); // Move to next step on success
    } catch (error) {
      console.error('Step 1 submission error:', error);
      // Error handling is done in the parent component
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your work context
        </h2>
        <p className="text-gray-600">
          This helps us understand your work environment and tailor our recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your job role? *
          </label>
          <input
            type="text"
            value={formData.job_role}
            onChange={(e) => handleInputChange('job_role', e.target.value)}
            placeholder="e.g., Software Engineer, Product Manager, Designer"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.job_role ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.job_role && (
            <p className="mt-1 text-sm text-red-600">{errors.job_role}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What industry do you work in? *
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            placeholder="e.g., Technology, Healthcare, Finance"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.industry ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company size *
          </label>
          <select
            value={formData.company_size}
            onChange={(e) => handleInputChange('company_size', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.company_size ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select company size</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.company_size && (
            <p className="mt-1 text-sm text-red-600">{errors.company_size}</p>
          )}
        </div>

        {/* Work Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work location *
          </label>
          <select
            value={formData.work_location}
            onChange={(e) => handleInputChange('work_location', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.work_location ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select work location</option>
            <option value="remote">Remote</option>
            <option value="office">Office</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.work_location && (
            <p className="mt-1 text-sm text-red-600">{errors.work_location}</p>
          )}
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start time
            </label>
            <select
              value={formData.working_hours_start}
              onChange={(e) => handleInputChange('working_hours_start', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End time
            </label>
            <select
              value={formData.working_hours_end}
              onChange={(e) => handleInputChange('working_hours_end', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team size (including you)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.team_size}
            onChange={(e) => handleInputChange('team_size', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Work Autonomy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How much autonomy do you have in your work?
          </label>
          <select
            value={formData.work_autonomy}
            onChange={(e) => handleInputChange('work_autonomy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select autonomy level</option>
            <option value="high">High - I make most decisions independently</option>
            <option value="medium">Medium - I have some decision-making freedom</option>
            <option value="low">Low - Most decisions are made by others</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
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