'use client'

import Link from 'next/link'
import { AuthHeader } from '@/components/layout/AuthHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <AuthHeader />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8 bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Check your email
              </h2>
              <br></br>
              <p className="text-gray-600 text-lg">
                We've sent you an email with a link to verify your account.<br />
                Please check your inbox and follow the instructions.
              </p>
            </div>
            <div className="text-center mt-8">
              <Link href="/auth/signin">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-2xl transform hover:scale-105 transition-all duration-300">
                  Return to sign in
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 