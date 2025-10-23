'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setIsLoading(false)
        setIsVisible(true)
      }
    }

    checkAuth()

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Subtle Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 pointer-events-none" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% ${20 + scrollY * 0.1}%, rgba(255, 255, 255, 0.03), transparent 50%)`,
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 hover:bg-white/10 transition-all duration-300">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm text-white/80">Real-time Market Intelligence</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight">
            Stock News Alert
          </h1>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered stock news aggregation with intelligent alerts.
            <br />
            Stay ahead of the market with real-time insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard"
              className="px-8 py-4 bg-white text-black rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
            >
              Get Started
            </a>
            <a
              href="#problems"
              className="px-8 py-4 border border-white/20 rounded-xl font-medium hover:bg-white/5 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </a>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            {[
              { label: 'Time Saved Daily', value: '2h+' },
              { label: 'Decision Accuracy', value: '95%' },
              { label: 'Real-time Updates', value: '5s' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
                style={{
                  transitionDelay: `${i * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section id="problems" className="relative py-32 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              The problems you face every day
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Investing shouldn't be this hard. Yet these challenges hold you back.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                title: 'Information Overload',
                problem: 'Drowning in thousands of articles, tweets, and SEC filings every day',
                impact: 'You miss critical news while wasting hours on irrelevant information',
              },
              {
                title: 'Delayed Reactions',
                problem: 'Finding out about market-moving news too late',
                impact: 'Opportunities vanish in minutes while you\'re still catching up',
              },
              {
                title: 'Analysis Paralysis',
                problem: 'Unable to quickly assess how news impacts your portfolio',
                impact: 'Hesitation costs you money as markets move without you',
              },
              {
                title: 'Fragmented Sources',
                problem: 'Jumping between 10+ platforms to get the complete picture',
                impact: 'Incomplete information leads to poor investment decisions',
              },
              {
                title: 'No Actionable Insights',
                problem: 'Reading news but not knowing what action to take',
                impact: 'Information without guidance is just noise',
              },
              {
                title: 'Missing Market Context',
                problem: 'Understanding individual news but missing sector-wide implications',
                impact: 'You see the tree but miss the forest, leading to blind spots',
              },
            ].map((pain, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500"
              >
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  {pain.title}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-white/40 mb-1 uppercase tracking-wider">The Problem</div>
                    <p className="text-white/70 leading-relaxed">
                      {pain.problem}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm text-white/40 mb-1 uppercase tracking-wider">The Cost</div>
                    <p className="text-white/60 leading-relaxed">
                      {pain.impact}
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-1 rounded-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              What you gain
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Transform how you invest with intelligence that works for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: 'Reclaim Your Time',
                benefit: 'Save 2+ hours daily with AI-summarized news from all major sources in one place',
                value: 'Focus on strategy, not searching',
              },
              {
                title: 'Never Miss Opportunities',
                benefit: 'Get instant alerts the moment market-moving news breaks, delivered to your preferred channel',
                value: 'React in seconds, not hours',
              },
              {
                title: 'Make Confident Decisions',
                benefit: 'AI-powered analysis shows you exactly how news impacts your stocks with clear buy/hold/sell signals',
                value: 'Know what to do, immediately',
              },
              {
                title: 'Complete Market Picture',
                benefit: 'See how news affects entire sectors and related stocks, not just individual companies',
                value: 'Understand the full context',
              },
              {
                title: 'Real-Time Advantage',
                benefit: '5-second market data updates keep you ahead of delayed information on other platforms',
                value: 'Always stay one step ahead',
              },
              {
                title: 'Professional-Grade Insights',
                benefit: 'Access institutional-level analysis previously available only to hedge funds',
                value: 'Invest like a professional',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
                style={{
                  transitionDelay: `${(i % 3) * 100}ms`,
                }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  {benefit.title}
                </h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  {benefit.benefit}
                </p>
                <div className="text-sm text-white/50 italic">
                  → {benefit.value}
                </div>
                <div className="mt-6 h-1 rounded-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              How it works
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Powerful features designed for modern investors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: 'Multi-Source News Aggregation',
                description: 'Comprehensive news coverage from SEC Edgar, Yahoo Finance, and social media platforms in real-time',
              },
              {
                title: 'AI-Powered Summarization',
                description: 'Concise 2-sentence summaries with intelligent impact scoring from 1 to 5 using Google Gemini AI',
              },
              {
                title: 'Smart Alert System',
                description: 'Real-time notifications delivered via Telegram, Email, or Web Push for critical market events',
              },
              {
                title: 'Market Overview Dashboard',
                description: 'Live tracking of S&P 500, NASDAQ, DOW JONES, and VIX indices with 5-second WebSocket updates',
              },
              {
                title: 'Interactive Stock Charts',
                description: 'Professional TradingView charts with real-time price data and comprehensive technical indicators',
              },
              {
                title: 'Market Impact Analysis',
                description: 'AI-powered assessment of short-term and long-term market impacts with predictive insights',
              },
              {
                title: 'Investor Intelligence',
                description: 'Tailored recommendations for retail and institutional investors with actionable insights',
              },
              {
                title: 'Semantic Keyword Analysis',
                description: 'Advanced highlighting of bullish, bearish, technical, and financial signals using NLP',
              },
              {
                title: 'Real-Time Data Streaming',
                description: 'WebSocket-powered 5-second market data updates with automatic reconnection handling',
              },
              {
                title: 'Sector Impact Tracking',
                description: 'Detailed breakdown of how news affects different market sectors with correlation analysis',
              },
              {
                title: 'Responsive Architecture',
                description: 'Seamless cross-platform experience optimized for desktop, tablet, and mobile devices',
              },
              {
                title: 'Multi-Language Support',
                description: 'Intelligent content localization with support for multiple languages and regional formats',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
                style={{
                  transitionDelay: `${(i % 3) * 100}ms`,
                }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 h-1 rounded-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Start making smarter investments today
          </h2>
          <p className="text-xl text-white/60 mb-12">
            Join thousands of investors who have already transformed their decision-making process
          </p>
          <a
            href="/dashboard"
            className="inline-block px-10 py-5 bg-white text-black rounded-xl font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
          >
            Get Started for Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40">
            © 2025 Stock News Alert. Built with AI-powered intelligence.
          </p>
        </div>
      </footer>
    </main>
  )
}
