'use client'

import { useEffect, useState, useRef } from 'react'
import { fetchNews } from '@/lib/api'
import Header from '@/components/Header'

type Category = 'all' | 'tech' | 'economy' | 'forex' | 'trade' | 'energy' | 'crypto'

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 마지막 뉴스 로드 시간 추적 (1분 캐싱)
  const lastNewsLoadTime = useRef<number>(0)
  const NEWS_CACHE_DURATION = 60000 // 1분 (밀리초)

  useEffect(() => {
    loadNews()

    // Auto-refresh news every 30 seconds (silently in background)
    const interval = setInterval(() => {
      loadNews(true) // silent refresh
    }, 30000)

    return () => clearInterval(interval)
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
      const data = await fetchNews(50)
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

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'tech', label: 'Tech' },
    { id: 'economy', label: 'Economy' },
    { id: 'forex', label: 'Forex' },
    { id: 'trade', label: 'Trade' },
    { id: 'energy', label: 'Energy' },
    { id: 'crypto', label: 'Crypto' },
  ]

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

  const filteredNews = news.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header title="News" />

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Search & Filter Section */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white/[0.13] text-white/90'
                    : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09] hover:text-white/90'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
              <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Total</div>
              <div className="text-[18px] font-medium text-white/90">{filteredNews.length}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
              <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">High Impact</div>
              <div className="text-[18px] font-medium text-red-400">
                {filteredNews.filter(n => n.impact_score >= 4).length}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
              <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Medium</div>
              <div className="text-[18px] font-medium text-amber-400">
                {filteredNews.filter(n => n.impact_score === 3).length}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
              <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Last Update</div>
              <div className="text-[13px] font-medium text-emerald-400">2m ago</div>
            </div>
          </div>
        </div>

        {/* News List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[13px] font-medium text-white/50 uppercase tracking-wider">
              {activeCategory === 'all' ? 'All News' : categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-md text-[13px] text-white/70 focus:outline-none focus:border-white/[0.15]">
                <option value="latest">Latest</option>
                <option value="impact">Impact</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
              <div className="text-[14px] text-white/40">Loading...</div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[14px] text-white/40 mb-2">No results found</div>
              <p className="text-[13px] text-white/30 mb-4">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
                className="px-4 py-2 bg-white/[0.09] hover:bg-white/[0.13] text-[13px] text-white/90 font-medium rounded-md transition-all"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((item: any, idx: number) => (
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

        {/* Load More Button */}
        {!loading && filteredNews.length > 0 && (
          <div className="mt-6 text-center">
            <button className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-[13px] text-white/70 hover:text-white/90 font-medium rounded-md transition-all">
              Load more
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
