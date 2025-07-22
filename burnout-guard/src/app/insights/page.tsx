'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Insights 📊
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Here you will find more detailed insights into your work patterns, health metrics, and burnout risk.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
