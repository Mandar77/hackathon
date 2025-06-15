'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AuthHeader } from '@/components/layout/AuthHeader'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'


export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { signUp } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }
            await signUp(email, password)
            // After successful signup, redirect to dashboard
            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
            <AuthHeader />
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Join Burnout Guard! 🌟
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Start your journey to better work-life balance
                        </p>
                    </div>

                    <Card className="p-8 bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-xl">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                                    <div className="text-sm text-red-600">{error}</div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors duration-200"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirm-password"
                                            name="confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="confirm-password"
                                            required
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors duration-200"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/auth/signin"
                                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300"
                                >
                                    Already have an account? Sign in
                                </Link>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
} 