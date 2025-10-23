'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TradingViewChart from '@/components/TradingViewChart'
import Header from '@/components/Header'

export default function NewsDetailPage() {
  const params = useParams()
  const [news, setNews] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('full-article')
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(['bullish', 'bearish', 'technical', 'financial', 'market']))
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  const loadingMessages = [
    'Analyzing news article...',
    'Evaluating market impact...',
    'Generating investment insights...',
    'Analyzing risk factors...',
    'Identifying bullish/bearish factors...',
    'Reviewing technical indicators...',
    'Analyzing financial data...',
    'Preparing recommendations...',
  ]

  useEffect(() => {
    loadNewsDetail()
  }, [params.id])

  // Rotate loading messages every 2 seconds
  useEffect(() => {
    if (!analysisLoading) {
      setLoadingMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [analysisLoading])

  const loadNewsDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/news/${params.id}`)
      const data = await response.json()
      setNews(data)

      // Load AI analysis
      loadAnalysis()
    } catch (error) {
      console.error('Failed to load news detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/news/${params.id}/analysis`)
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Failed to load analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const getImpactLabel = (score: number) => {
    if (score >= 4) return 'High'
    if (score >= 3) return 'Medium'
    return 'Low'
  }

  const getImpactColor = (score: number) => {
    if (score >= 4) return 'text-red-400'
    if (score >= 3) return 'text-amber-400'
    return 'text-emerald-400'
  }

  // Keyword highlighting configuration
  const keywordCategories = {
    bullish: {
      keywords: ['breakthrough', 'revolutionary', 'unprecedented', 'surge', 'climbing', 'upward', 'strengthened', 'expanded', 'significant leap', 'positively', 'benefiting', 'improvements', 'accelerating'],
      color: 'text-emerald-400',
      label: 'Bullish Signal'
    },
    bearish: {
      keywords: ['questions', 'scramble', 'bottlenecks', 'limiting factors', 'reducing', 'challenges', 'risks'],
      color: 'text-red-400',
      label: 'Risk Factor'
    },
    technical: {
      keywords: ['GPU architecture', 'Blackwell Ultra', 'computational efficiency', '5x performance', '40%', 'AI infrastructure', 'large language model', 'advanced manufacturing'],
      color: 'text-blue-400',
      label: 'Technical Detail'
    },
    financial: {
      keywords: ['8.5%', 'after-hours trading', 'price targets', 'competitive position', 'total addressable market', 'investment banks', 'Financial markets', 'shares'],
      color: 'text-amber-400',
      label: 'Financial Impact'
    },
    market: {
      keywords: ['NVIDIA Corporation', 'semiconductor industry', 'enterprise', 'consumer markets', 'healthcare', 'autonomous vehicles', 'scientific research', 'technology sector'],
      color: 'text-purple-400',
      label: 'Market Context'
    }
  }

  // Toggle category filter
  const toggleCategory = (category: string) => {
    const newCategories = new Set(activeCategories)
    if (newCategories.has(category)) {
      newCategories.delete(category)
    } else {
      newCategories.add(category)
    }
    setActiveCategories(newCategories)
  }

  // Toggle all categories
  const toggleAll = () => {
    if (activeCategories.size === Object.keys(keywordCategories).length) {
      setActiveCategories(new Set())
    } else {
      setActiveCategories(new Set(['bullish', 'bearish', 'technical', 'financial', 'market']))
    }
  }

  // Function to highlight keywords in text
  const highlightText = (text: string) => {
    let result = text
    const matches: Array<{ start: number; end: number; category: string }> = []

    // Find all keyword matches (only for active categories)
    Object.entries(keywordCategories).forEach(([category, config]) => {
      if (!activeCategories.has(category)) return // Skip if category is not active

      config.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        let match
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            category
          })
        }
      })
    })

    // Sort by position and remove overlaps
    matches.sort((a, b) => a.start - b.start)
    const filteredMatches = matches.filter((match, i) => {
      if (i === 0) return true
      const prev = matches[i - 1]
      return match.start >= prev.end
    })

    if (filteredMatches.length === 0) return text

    // Build highlighted text
    const parts = []
    let lastIndex = 0

    filteredMatches.forEach((match, i) => {
      // Add text before match
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>{text.slice(lastIndex, match.start)}</span>
        )
      }

      // Add highlighted match
      const category = keywordCategories[match.category as keyof typeof keywordCategories]
      parts.push(
        <span
          key={`match-${i}`}
          className={`${category.color} font-semibold cursor-help transition-colors hover:opacity-80`}
          title={category.label}
        >
          {text.slice(match.start, match.end)}
        </span>
      )

      lastIndex = match.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">{text.slice(lastIndex)}</span>
      )
    }

    return <>{parts}</>
  }

  // Get article content
  const fullArticle = news?.content || news?.summary || 'Article content not available.'

  const tabs = [
    { id: 'full-article', label: 'Full Article' },
    { id: 'market-impact', label: 'Market Impact' },
    { id: 'investor-insights', label: 'Investor Insights' },
    { id: 'ai-recommendation', label: 'Recommendation' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
          <div className="text-[14px] text-white/40">Loading...</div>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[14px] text-white/40 mb-4">News not found</div>
          <a href="/news" className="px-4 py-2 bg-white/[0.09] hover:bg-white/[0.13] border border-white/[0.08] text-[13px] text-white/90 rounded-md transition-all inline-block">
            Back to News
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header title="News Detail" />

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-8 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {news.stocks?.ticker && (
                  <a
                    href={`/stocks/${news.stocks.ticker}`}
                    className="px-3 py-1.5 bg-white/[0.09] hover:bg-white/[0.13] text-white/90 rounded-md text-[13px] font-medium transition-all inline-flex items-center gap-2"
                  >
                    {news.stocks.ticker}
                    <span className="text-[10px] text-white/40">→ View Financials</span>
                  </a>
                )}
                {news.impact_score && (
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${getImpactColor(news.impact_score)}`}>
                    {getImpactLabel(news.impact_score)} impact
                  </span>
                )}
              </div>
              <h1 className="text-[32px] font-medium text-white/90 leading-tight mb-4">
                {news.title}
              </h1>
              <div className="flex items-center gap-6 text-[13px]">
                <span className="text-white/70">{news.source}</span>
                {news.stocks?.company_name && (
                  <span className="text-white/50">{news.stocks.company_name}</span>
                )}
                {news.published_at && (
                  <span className="text-white/30">
                    {new Date(news.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {news.summary && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
              <div className="text-[11px] text-white/30 mb-3 uppercase tracking-wider">Summary</div>
              <p className="text-[14px] text-white/70 leading-relaxed">
                {news.summary}
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-1 border-b border-white/[0.06]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[13px] font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-white/90'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/90"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Full Article Tab */}
          {activeTab === 'full-article' && (
            <div className="space-y-8">
              {/* Stock Chart */}
              {news.stocks?.ticker && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
                  <div className="text-[13px] text-white/50 mb-4 uppercase tracking-wider">
                    Live Chart - {news.stocks.ticker}
                  </div>
                  <div className="rounded-lg overflow-hidden border border-white/[0.06]">
                    <TradingViewChart symbol={news.stocks.ticker} height="500" />
                  </div>
                </div>
              )}

              {/* Keyword Filter Controls */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] text-white/50 uppercase tracking-wider">Keyword Highlights</div>
                  <button
                    onClick={toggleAll}
                    className="px-3 py-1.5 text-[12px] text-white/70 hover:text-white/90 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-md transition-all"
                  >
                    {activeCategories.size === Object.keys(keywordCategories).length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Category Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(keywordCategories).map(([key, config]) => {
                    const isActive = activeCategories.has(key)
                    return (
                      <button
                        key={key}
                        onClick={() => toggleCategory(key)}
                        className={`px-3 py-2 text-[12px] font-medium rounded-md border transition-all ${
                          isActive
                            ? `${config.color} border-${config.color.replace('text-', '')}/30 bg-white/[0.03]`
                            : 'text-white/30 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isActive ? config.color.replace('text-', 'bg-') : 'bg-white/20'}`}></div>
                          {config.label}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <p className="text-[11px] text-white/30">
                  Click categories to toggle highlights. Hover over highlighted text for details. AI-powered semantic analysis.
                </p>
              </div>

              {/* Full Article Content */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
                <div className="text-[13px] text-white/50 mb-6 uppercase tracking-wider">Article</div>
                <div className="space-y-4">
                  {fullArticle.split('\n\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="text-[14px] text-white/70 leading-relaxed">
                      {highlightText(paragraph)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Market Impact Tab */}
          {activeTab === 'market-impact' && (
            <div className="space-y-8">
              {analysisLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
                  <div className="text-[14px] text-white/70 font-medium mb-2 transition-all duration-300">
                    {loadingMessages[loadingMessageIndex]}
                  </div>
                  <div className="text-[12px] text-white/40">Please wait a moment</div>
                </div>
              ) : analysis?.market_impact ? (
                <>
                  {/* Overall Impact */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
                    <div className="text-[13px] text-white/50 mb-6 uppercase tracking-wider">Market Impact Analysis</div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Short-term */}
                      {analysis.market_impact.short_term && (
                        <div>
                          <div className="text-[14px] text-white/90 mb-4 font-medium">Short-term (1-7 days)</div>
                          <div className="space-y-4">
                            {Object.entries(analysis.market_impact.short_term).map(([key, value]: [string, any]) => (
                              <div key={key}>
                                <div className="flex justify-between mb-2">
                                  <span className="text-[13px] text-white/70 capitalize">{key.replace(/_/g, ' ')}</span>
                                  <span className={`text-[13px] ${
                                    typeof value === 'string' && value.includes('+') ? 'text-emerald-400' :
                                    typeof value === 'string' && value.toLowerCase().includes('high') ? 'text-red-400' :
                                    'text-white/70'
                                  }`}>
                                    {value}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Long-term */}
                      {analysis.market_impact.long_term && (
                        <div>
                          <div className="text-[14px] text-white/90 mb-4 font-medium">Long-term (1-3 months)</div>
                          <div className="space-y-4">
                            {Object.entries(analysis.market_impact.long_term).map(([key, value]: [string, any]) => (
                              <div key={key}>
                                <div className="flex justify-between mb-2">
                                  <span className="text-[13px] text-white/70 capitalize">{key.replace(/_/g, ' ')}</span>
                                  <span className={`text-[13px] ${
                                    typeof value === 'string' && value.toLowerCase().includes('strong') ? 'text-emerald-400' :
                                    typeof value === 'string' && value.toLowerCase().includes('high') ? 'text-amber-400' :
                                    'text-white/70'
                                  }`}>
                                    {value}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sector Impact */}
                  {analysis.market_impact.sector_impacts && analysis.market_impact.sector_impacts.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
                      <div className="text-[13px] text-white/50 mb-6 uppercase tracking-wider">Sector Impact</div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {analysis.market_impact.sector_impacts.map((sector: any, idx: number) => (
                          <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5">
                            <div className="text-[13px] text-white/70 mb-2">{sector.sector}</div>
                            <div className={`text-[20px] font-medium mb-2 ${
                              sector.change?.includes('+') ? 'text-emerald-400' :
                              sector.change?.includes('-') ? 'text-red-400' : 'text-white/70'
                            }`}>{sector.change}</div>
                            <p className="text-[12px] text-white/40">{sector.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Market Sentiment */}
                  {analysis.market_impact.market_sentiments && analysis.market_impact.market_sentiments.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
                      <div className="text-[13px] text-white/50 mb-6 uppercase tracking-wider">Market Sentiment</div>
                      <div className="space-y-4">
                        {analysis.market_impact.market_sentiments.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[13px] text-white/90">{item.source}</span>
                              <div className="text-right">
                                <div className="text-[11px] text-white/50">{item.label}</div>
                                <div className="text-[11px] text-white/30">{item.score}/100</div>
                              </div>
                            </div>
                            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white/[0.3] rounded-full"
                                style={{ width: `${item.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-[14px] text-white/40 mb-2">Analysis not available</div>
                  <p className="text-[13px] text-white/30">AI analysis could not be generated for this article</p>
                </div>
              )}
            </div>
          )}

          {/* Investor Insights Tab */}
          {activeTab === 'investor-insights' && (
            <div className="space-y-8">
              {analysisLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
                  <div className="text-[14px] text-white/70 font-medium mb-2 transition-all duration-300">
                    {loadingMessages[loadingMessageIndex]}
                  </div>
                  <div className="text-[12px] text-white/40">Please wait a moment</div>
                </div>
              ) : analysis?.investor_insights && analysis.investor_insights.length > 0 ? (
                <>
                  {analysis.investor_insights.map((insight: any, idx: number) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
                      <div className="mb-6">
                        <div className="text-[13px] text-white/50 mb-2 uppercase tracking-wider">
                          {insight.investor_type === 'retail' ? 'Retail Investors' : 'Institutional Investors'}
                        </div>
                        <div className="text-[14px] text-white/70">
                          {insight.investor_type === 'retail'
                            ? 'For personal investment portfolios and long-term growth'
                            : 'For corporate strategy and large-scale investment decisions'}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Opportunities and Risks */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
                          <div className="text-[14px] text-white/90 mb-4 font-medium">
                            {insight.investor_type === 'retail' ? 'Investment Opportunity' : 'Strategic Implications'}
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Opportunities */}
                            {insight.opportunities && insight.opportunities.length > 0 && (
                              <div>
                                <div className="text-[13px] text-emerald-400 mb-3 font-medium">Opportunities</div>
                                <ul className="space-y-2 text-[12px] text-white/60">
                                  {insight.opportunities.map((opp: string, i: number) => (
                                    <li key={i}>• {opp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Risks */}
                            {insight.risks && insight.risks.length > 0 && (
                              <div>
                                <div className="text-[13px] text-red-400 mb-3 font-medium">Risks</div>
                                <ul className="space-y-2 text-[12px] text-white/60">
                                  {insight.risks.map((risk: string, i: number) => (
                                    <li key={i}>• {risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Items */}
                        {insight.action_items && insight.action_items.length > 0 && (
                          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
                            <div className="text-[14px] text-white/90 mb-4 font-medium">Action Items</div>
                            <div className="space-y-3">
                              {insight.action_items.map((item: string, i: number) => (
                                <div key={i} className="flex gap-3 text-[13px] text-white/70">
                                  <span className="text-white/40">{i + 1}.</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-[14px] text-white/40 mb-2">Investor insights not available</div>
                  <p className="text-[13px] text-white/30">AI analysis could not be generated for this article</p>
                </div>
              )}
            </div>
          )}

          {/* AI Recommendation Tab */}
          {activeTab === 'ai-recommendation' && (
            <div className="space-y-8">
              {analysisLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
                  <div className="text-[14px] text-white/70 font-medium mb-2 transition-all duration-300">
                    {loadingMessages[loadingMessageIndex]}
                  </div>
                  <div className="text-[12px] text-white/40">Please wait a moment</div>
                </div>
              ) : analysis?.ai_recommendation ? (
                <>
                  {/* AI Summary */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-8">
                    <div className="mb-6">
                      <div className="text-[13px] text-white/50 mb-2 uppercase tracking-wider">AI-Powered Analysis</div>
                      <div className="text-[14px] text-white/70">Gemini AI-powered investment recommendation</div>
                    </div>

                    {/* Verdict */}
                    <div className={`${
                      analysis.ai_recommendation.recommendation === 'BUY' ? 'bg-emerald-400/10 border-emerald-400/20' :
                      analysis.ai_recommendation.recommendation === 'SELL' ? 'bg-red-400/10 border-red-400/20' :
                      'bg-amber-400/10 border-amber-400/20'
                    } border rounded-lg p-8 mb-8 text-center`}>
                      <div className={`inline-block px-6 py-3 ${
                        analysis.ai_recommendation.recommendation === 'BUY' ? 'bg-emerald-400/20 text-emerald-400' :
                        analysis.ai_recommendation.recommendation === 'SELL' ? 'bg-red-400/20 text-red-400' :
                        'bg-amber-400/20 text-amber-400'
                      } rounded-lg font-medium text-[15px] mb-3`}>
                        {analysis.ai_recommendation.recommendation} RECOMMENDATION
                      </div>
                      <div className="text-[13px] text-white/60">
                        Confidence: <span className={`${
                          analysis.ai_recommendation.confidence >= 80 ? 'text-emerald-400' :
                          analysis.ai_recommendation.confidence >= 60 ? 'text-amber-400' :
                          'text-red-400'
                        } font-medium`}>{analysis.ai_recommendation.confidence}%</span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-4 gap-4 mb-8">
                      {analysis.ai_recommendation.target_price && (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Target Price</div>
                          <div className="text-[20px] font-medium text-emerald-400 mb-1">${analysis.ai_recommendation.target_price}</div>
                          <div className="text-[11px] text-white/40">AI Target</div>
                        </div>
                      )}
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center">
                        <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Risk Score</div>
                        <div className={`text-[20px] font-medium mb-1 ${
                          analysis.ai_recommendation.risk_score >= 7 ? 'text-red-400' :
                          analysis.ai_recommendation.risk_score >= 4 ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>{analysis.ai_recommendation.risk_score}/10</div>
                        <div className="text-[11px] text-white/40">
                          {analysis.ai_recommendation.risk_score >= 7 ? 'High Risk' :
                           analysis.ai_recommendation.risk_score >= 4 ? 'Moderate' : 'Low Risk'}
                        </div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center">
                        <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Hold Period</div>
                        <div className="text-[20px] font-medium text-white/70 mb-1">{analysis.ai_recommendation.hold_period}</div>
                        <div className="text-[11px] text-white/40">Recommended</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center">
                        <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Confidence</div>
                        <div className={`text-[20px] font-medium mb-1 ${
                          analysis.ai_recommendation.confidence >= 80 ? 'text-emerald-400' :
                          analysis.ai_recommendation.confidence >= 60 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>{analysis.ai_recommendation.confidence}%</div>
                        <div className="text-[11px] text-white/40">
                          {analysis.ai_recommendation.confidence >= 80 ? 'Very High' :
                           analysis.ai_recommendation.confidence >= 60 ? 'Moderate' : 'Low'}
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    {analysis.ai_recommendation.reasoning && (
                      <div className="space-y-6">
                        {/* Bullish Factors */}
                        {analysis.ai_recommendation.reasoning.bullish && analysis.ai_recommendation.reasoning.bullish.length > 0 && (
                          <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-lg p-6">
                            <div className="text-[13px] text-emerald-400 mb-4 font-medium uppercase tracking-wider">Bullish Factors</div>
                            <div className="space-y-3">
                              {analysis.ai_recommendation.reasoning.bullish.map((factor: string, i: number) => (
                                <div key={i} className="flex gap-3">
                                  <span className="text-[13px] text-white/40">{i + 1}.</span>
                                  <p className="text-[13px] text-white/70">{factor}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bearish Factors */}
                        {analysis.ai_recommendation.reasoning.bearish && analysis.ai_recommendation.reasoning.bearish.length > 0 && (
                          <div className="bg-red-400/5 border border-red-400/10 rounded-lg p-6">
                            <div className="text-[13px] text-red-400 mb-4 font-medium uppercase tracking-wider">Risk Factors</div>
                            <div className="space-y-3">
                              {analysis.ai_recommendation.reasoning.bearish.map((factor: string, i: number) => (
                                <div key={i} className="flex gap-3">
                                  <span className="text-[13px] text-white/40">{i + 1}.</span>
                                  <p className="text-[13px] text-white/70">{factor}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technical Factors */}
                        {analysis.ai_recommendation.reasoning.technical && analysis.ai_recommendation.reasoning.technical.length > 0 && (
                          <div className="bg-blue-400/5 border border-blue-400/10 rounded-lg p-6">
                            <div className="text-[13px] text-blue-400 mb-4 font-medium uppercase tracking-wider">Technical Analysis</div>
                            <div className="space-y-3">
                              {analysis.ai_recommendation.reasoning.technical.map((factor: string, i: number) => (
                                <div key={i} className="flex gap-3">
                                  <span className="text-[13px] text-white/40">{i + 1}.</span>
                                  <p className="text-[13px] text-white/70">{factor}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Financial Factors */}
                        {analysis.ai_recommendation.reasoning.financial && analysis.ai_recommendation.reasoning.financial.length > 0 && (
                          <div className="bg-amber-400/5 border border-amber-400/10 rounded-lg p-6">
                            <div className="text-[13px] text-amber-400 mb-4 font-medium uppercase tracking-wider">Financial Analysis</div>
                            <div className="space-y-3">
                              {analysis.ai_recommendation.reasoning.financial.map((factor: string, i: number) => (
                                <div key={i} className="flex gap-3">
                                  <span className="text-[13px] text-white/40">{i + 1}.</span>
                                  <p className="text-[13px] text-white/70">{factor}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-6">
                    <div className="text-[13px] text-amber-400 mb-2 font-medium uppercase tracking-wider">Disclaimer</div>
                    <p className="text-[12px] text-white/60 leading-relaxed">
                      This AI-powered analysis is for informational purposes only and does not constitute financial advice.
                      Past performance does not guarantee future results. Always conduct your own research and consult with a qualified financial advisor.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-[14px] text-white/40 mb-2">AI recommendation not available</div>
                  <p className="text-[13px] text-white/30">AI analysis could not be generated for this article</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
