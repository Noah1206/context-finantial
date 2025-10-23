'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.detail || 'Signup failed. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-8">
      <div className="w-full max-w-[400px]">
        {/* Logo/Brand */}
        <div className="mb-12 text-center">
          <h1 className="text-[24px] font-medium text-white/90 mb-2">StockPulse</h1>
          <p className="text-[13px] text-white/40">AI-powered stock news analysis</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
          <h2 className="text-[15px] font-medium text-white/90 mb-6">Create your account</h2>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-400/10 border border-red-400/20 rounded-lg">
              <p className="text-[13px] text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-[13px] text-white/70 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] text-white/70 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
              />
              <p className="mt-2 text-[11px] text-white/40">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-[13px] text-white/70 mb-2">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-white/[0.09] hover:bg-white/[0.13] border border-white/[0.08] text-[14px] text-white/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-[13px] text-white/50 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-white/90 hover:text-white transition-colors">
                Log in
              </a>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
            ← Back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
