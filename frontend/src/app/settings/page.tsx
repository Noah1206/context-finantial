'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

export default function Settings() {
  const [nickname, setNickname] = useState('')
  const [telegramId, setTelegramId] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('free')
  const [enableEmail, setEnableEmail] = useState(true)
  const [enableTelegram, setEnableTelegram] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserId(user.id)
        setEmail(user.email)
        setNickname(user.nickname || '')
        setPlan(user.plan || 'free')
        setTelegramId(user.telegram_id || '')
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      alert('Please log in first')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: nickname.trim() || null,
          telegram_id: enableTelegram ? telegramId : null,
          enable_email_alerts: enableEmail,
          enable_telegram_alerts: enableTelegram
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()

        // Update localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          user.nickname = nickname.trim() || null
          user.telegram_id = enableTelegram ? telegramId : null
          localStorage.setItem('user', JSON.stringify(user))
        }

        alert('Settings saved successfully!')

        // Refresh the page to update header
        window.location.reload()
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header title="Settings" />

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-8 py-12">
        <form onSubmit={handleSave} className="space-y-12">
          {/* Account Section */}
          <section>
            <h2 className="text-[13px] font-medium text-white/50 mb-6 uppercase tracking-wider">Account</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] text-white/70 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
                />
                <p className="mt-2 text-[11px] text-white/40">
                  This will be displayed in the header
                </p>
              </div>
              <div>
                <label className="block text-[14px] text-white/70 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[14px] text-white/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[14px] text-white/70 mb-2">
                  Current plan
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[14px] text-white/50 capitalize">
                    {plan} Plan
                  </div>
                  {plan === 'free' && (
                    <a
                      href="#"
                      className="px-4 py-2.5 bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/30 rounded-lg text-[14px] text-emerald-400 transition-all font-medium"
                    >
                      Upgrade to Pro
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h2 className="text-[13px] font-medium text-white/50 mb-6 uppercase tracking-wider">Notifications</h2>
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <div>
                  <div className="text-[14px] text-white/90 mb-0.5">Email notifications</div>
                  <div className="text-[13px] text-white/40">Receive alerts via email</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableEmail}
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/[0.2] peer-checked:after:bg-white"></div>
                </label>
              </div>

              {/* Telegram Notifications */}
              <div className="py-3 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[14px] text-white/90 mb-0.5">Telegram notifications</div>
                    <div className="text-[13px] text-white/40">Receive instant alerts on Telegram</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTelegram}
                      onChange={(e) => setEnableTelegram(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/[0.2] peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {enableTelegram && (
                  <div className="mt-4">
                    <label className="block text-[13px] text-white/60 mb-2">
                      Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      placeholder="Enter your Telegram chat ID"
                      className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-6 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={saving || !userId}
              className="px-6 py-2.5 bg-white/[0.09] hover:bg-white/[0.13] border border-white/[0.08] text-[14px] text-white/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
