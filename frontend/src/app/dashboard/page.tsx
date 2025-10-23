'use client'

import { useEffect, useState, useRef } from 'react'
import { fetchNews } from '@/lib/api'
import TradingViewChart from '@/components/TradingViewChart'
import Header from '@/components/Header'

export default function Dashboard() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [marketStats, setMarketStats] = useState<any[]>([])
  const [trendingStocks, setTrendingStocks] = useState<any[]>([])
  const [marketLoading, setMarketLoading] = useState(true)

  // 마지막 뉴스 로드 시간 추적 (1분 캐싱)
  const lastNewsLoadTime = useRef<number>(0)
  const NEWS_CACHE_DURATION = 60000 // 1분 (밀리초)

  useEffect(() => {
    loadNews()

    // Auto-refresh news every 30 seconds (silently in background)
    const newsInterval = setInterval(() => {
      loadNews(true) // silent refresh
    }, 30000)

    // WebSocket 연결 설정 (실시간 시장 데이터)
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
        ws = new WebSocket(`${wsUrl}/ws/market`)

        ws.onopen = () => {
          console.log('✅ WebSocket connected - Real-time market data active')
          setMarketLoading(false)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)

            if (message.type === 'initial' || message.type === 'update') {
              setMarketStats(message.data.overview || [])
              setTrendingStocks(message.data.trending || [])
              setMarketLoading(false)

              if (message.type === 'update') {
                console.log('📊 Market data updated via WebSocket')
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected - attempting reconnect in 5s')

          // 5초 후 재연결 시도
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Reconnecting WebSocket...')
            connectWebSocket()
          }, 5000)
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error)
      }
    }

    connectWebSocket()

    return () => {
      clearInterval(newsInterval)

      // WebSocket 정리
      if (ws) {
        ws.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadNews = async (silent = false) => {
    // 1분 이내에 재방문한 경우, 캐시된 데이터 사용 (새로고침 없음)
    const now = Date.now()
    const timeSinceLastLoad = now - lastNewsLoadTime.current

    if (timeSinceLastLoad < NEWS_CACHE_DURATION && news.length > 0) {
      console.log(`📦 Using cached news (${Math.round(timeSinceLastLoad / 1000)}s ago)`)
      if (!silent) {
        setLoading(false)
      }
      return
    }

    // 1분 이상 지났거나 첫 로드인 경우, 새로 fetch
    if (!silent) {
      setLoading(true)
    }

    try {
      console.log('🔄 Fetching fresh news...')
      const data = await fetchNews(20)
      setNews(data)
      lastNewsLoadTime.current = now
    } catch (error) {
      console.error('Failed to load news:', error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
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

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header title="Dashboard" />

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Market Overview */}
        <div className="mb-12">
          <h2 className="text-[13px] font-medium text-white/50 mb-6 uppercase tracking-wider">Market Overview</h2>
          {marketLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 animate-pulse"
                >
                  <div className="h-3 bg-white/10 rounded mb-2 w-20"></div>
                  <div className="h-6 bg-white/10 rounded mb-1 w-28"></div>
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : marketStats.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-[14px] text-white/40">Market data unavailable</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {marketStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg p-5 transition-all"
                >
                  <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-[20px] font-medium text-white/90 mb-1">{stat.value}</div>
                  <div className={`text-[13px] font-medium ${stat.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Stocks */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[13px] font-medium text-white/50 uppercase tracking-wider">Trending Stocks</h2>
            <span className="text-[13px] text-white/30">Top movers</span>
          </div>
          {marketLoading ? (
            <div className="grid md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="h-4 bg-white/10 rounded mb-1 w-16"></div>
                      <div className="h-3 bg-white/10 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-white/10 rounded w-14"></div>
                  </div>
                  <div className="h-5 bg-white/10 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : trendingStocks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-[14px] text-white/40">Trending stocks data unavailable</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {trendingStocks.map((stock, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg p-5 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-[14px] font-medium text-white/90">{stock.ticker}</div>
                      <div className="text-[13px] text-white/40">{stock.name}</div>
                    </div>
                    <div className={`text-[13px] font-medium ${stock.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stock.change}
                    </div>
                  </div>
                  <div className="text-[18px] font-medium text-white/90">{stock.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Market Charts */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[13px] font-medium text-white/50 uppercase tracking-wider">Market Charts</h2>
            <a
              href="/charts"
              className="text-[13px] text-white/50 hover:text-white/90 transition-all"
            >
              View all →
            </a>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <div className="text-[13px] text-white/70">S&P 500</div>
              </div>
              <TradingViewChart symbol="SPY" height="300" />
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <div className="text-[13px] text-white/70">NASDAQ</div>
              </div>
              <TradingViewChart symbol="QQQ" height="300" />
            </div>
          </div>
        </div>

        {/* Latest News */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[13px] font-medium text-white/50 uppercase tracking-wider">Latest News</h2>
            <span className="text-[13px] text-white/30">{news.length} articles</span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
              <div className="text-[14px] text-white/40">Loading...</div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[14px] text-white/40 mb-2">No news available</div>
              <p className="text-[13px] text-white/30">
                News will appear here once the data feed is active
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((item: any, idx: number) => (
                <a
                  key={idx}
                  href={`/news/${item.id}`}
                  className="block group"
                >
                  <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg p-5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {item.stocks?.ticker && (
                            <span className="text-[13px] font-medium text-white/70">
                              {item.stocks.ticker}
                            </span>
                          )}
                          {item.impact_score && (
                            <span className={`text-[11px] font-medium uppercase tracking-wider ${getImpactColor(item.impact_score)}`}>
                              {getImpactLabel(item.impact_score)} impact
                            </span>
                          )}
                        </div>
                        <h3 className="text-[14px] font-medium text-white/90 mb-2 group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-[13px] text-white/50 line-clamp-2 mb-3">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <span className="text-[12px] text-white/30">
                            {item.source}
                          </span>
                          {item.published_at && (
                            <span className="text-[12px] text-white/30">
                              {new Date(item.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.impact_score && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-[10px] ${i < item.impact_score ? 'text-white/60' : 'text-white/10'}`}>
                                ●
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[13px] text-white/30 group-hover:text-white/60 transition-colors">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
