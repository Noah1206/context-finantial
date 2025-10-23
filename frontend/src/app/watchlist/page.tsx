'use client'

import { useEffect, useState } from 'react'
import { fetchUserWatchlist, addToWatchlist } from '@/lib/api'
import TradingViewChart from '@/components/TradingViewChart'
import Header from '@/components/Header'

interface RealtimePrice {
  ticker: string
  current_price: number | null
  previous_close: number | null
  price_change: number | null
  percent_change: number | null
  day_high: number | null
  day_low: number | null
  volume: number | null
  timestamp: string
}

interface AlertData {
  should_alert: boolean
  alert_type: 'surge' | 'drop' | null
  percent_change: number | null
  current_price: number | null
  threshold: number
  ticker: string
  timestamp: string
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [ticker, setTicker] = useState('')
  const [threshold, setThreshold] = useState(3)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [priceData, setPriceData] = useState<Record<string, RealtimePrice>>({})
  const [alerts, setAlerts] = useState<Record<string, AlertData>>({})
  const [showAlerts, setShowAlerts] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserId(user.id)
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (userId) {
      loadWatchlist()
    }
  }, [userId])

  // Fetch realtime prices every 10 seconds
  useEffect(() => {
    if (watchlist.length === 0) return

    const fetchPrices = async () => {
      const tickers = watchlist.map((item: any) => item.stocks?.ticker).filter(Boolean)
      if (tickers.length === 0) return

      try {
        const response = await fetch('http://localhost:8000/api/stocks/prices/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tickers)
        })
        const data = await response.json()
        setPriceData(data)

        // Check alerts
        checkAlerts(tickers)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [watchlist])

  const checkAlerts = async (tickers: string[]) => {
    const alertResults: Record<string, AlertData> = {}

    for (const tickerSymbol of tickers) {
      const item = watchlist.find((w: any) => w.stocks?.ticker === tickerSymbol)
      if (!item) continue

      try {
        const response = await fetch(
          `http://localhost:8000/api/stocks/${tickerSymbol}/alert-check?threshold=${item.alert_threshold}`
        )
        const alertData = await response.json()
        alertResults[tickerSymbol] = alertData
      } catch (error) {
        console.error(`Failed to check alert for ${tickerSymbol}:`, error)
      }
    }

    setAlerts(alertResults)
  }

  const loadWatchlist = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const data = await fetchUserWatchlist(userId)
      setWatchlist(data)
    } catch (error) {
      console.error('Failed to load watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim() || !userId) return

    setAdding(true)
    try {
      await addToWatchlist(userId, ticker.toUpperCase(), threshold)
      setTicker('')
      setThreshold(3)
      await loadWatchlist()
    } catch (error) {
      console.error('Failed to add stock:', error)
      alert('Failed to add stock. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveStock = async (stockId: string) => {
    if (!confirm('Remove this stock from your watchlist?') || !userId) return

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/stocks/${stockId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadWatchlist()
      } else {
        throw new Error('Failed to remove stock')
      }
    } catch (error) {
      console.error('Failed to remove stock:', error)
      alert('Failed to remove stock. Please try again.')
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const formatPercent = (percent: number | null) => {
    if (percent === null || percent === undefined) return 'N/A'
    const sign = percent > 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
  }

  const formatVolume = (volume: number | null) => {
    if (volume === null || volume === undefined) return 'N/A'
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`
    return volume.toString()
  }

  const activeAlerts = Object.entries(alerts).filter(([_, alert]) => alert.should_alert)

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header
        title="Watchlist"
        rightContent={
          <div className="flex items-center gap-4">
            {activeAlerts.length > 0 && (
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[13px] text-red-400 hover:bg-red-500/20 transition-all"
              >
                <span className="animate-pulse">●</span>
                {activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}
              </button>
            )}
            <span className="text-[13px] text-white/40">{watchlist.length} stocks</span>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Active Alerts Section */}
        {showAlerts && activeAlerts.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-medium text-white">Active Alerts</h2>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-[13px] text-white/40 hover:text-white/60 transition-all"
              >
                Hide
              </button>
            </div>
            {activeAlerts.map(([tickerSymbol, alert]) => {
              const price = priceData[tickerSymbol]
              return (
                <div
                  key={tickerSymbol}
                  className={`p-4 rounded-lg border ${
                    alert.alert_type === 'surge'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-[14px] font-medium text-white">{tickerSymbol}</div>
                      <div
                        className={`text-[13px] font-medium ${
                          alert.alert_type === 'surge' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {alert.alert_type === 'surge' ? '📈 Surging' : '📉 Dropping'}
                      </div>
                      <div className="text-[13px] text-white/60">
                        {formatPercent(alert.percent_change)} • {formatPrice(alert.current_price)}
                      </div>
                    </div>
                    <div className="text-[12px] text-white/40">
                      Threshold: ±{alert.threshold}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Stock Form */}
        <div className="mb-12">
          <form onSubmit={handleAddStock} className="flex gap-3 items-end max-w-2xl">
            <div className="flex-1">
              <label className="block text-[13px] text-white/50 mb-2 font-medium">
                Add to watchlist
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter ticker symbol (e.g., AAPL, TSLA)..."
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 placeholder-white/30 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
                required
              />
            </div>
            <div className="w-40">
              <label className="block text-[13px] text-white/50 mb-2 font-medium">
                Alert level
              </label>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[14px] text-white/90 focus:bg-white/[0.08] focus:border-white/[0.15] focus:outline-none transition-all"
              >
                <option value={1}>Low (±5%)</option>
                <option value={2}>Medium-Low (±3%)</option>
                <option value={3}>Medium (±2%)</option>
                <option value={4}>High (±1%)</option>
                <option value={5}>Critical (±0.5%)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2.5 bg-white/[0.09] hover:bg-white/[0.13] border border-white/[0.08] text-[14px] text-white/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {adding ? 'Adding...' : 'Add Stock'}
            </button>
          </form>
        </div>

        {/* Watchlist */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/[0.1] border-t-white/[0.6] mb-4"></div>
            <div className="text-[14px] text-white/40">Loading watchlist...</div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[14px] text-white/40 mb-2">No stocks in watchlist</div>
            <p className="text-[13px] text-white/30">
              Add stocks above to start tracking price movements and alerts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((item: any) => {
              const tickerSymbol = item.stocks?.ticker || 'N/A'
              const price = priceData[tickerSymbol]
              const alert = alerts[tickerSymbol]
              const isAlerted = alert?.should_alert || false

              return (
                <div key={item.id} className="group">
                  <div
                    className={`bg-white/[0.03] hover:bg-white/[0.06] border rounded-lg transition-all ${
                      isAlerted
                        ? alert.alert_type === 'surge'
                          ? 'border-emerald-500/30'
                          : 'border-red-500/30'
                        : 'border-white/[0.06]'
                    }`}
                  >
                    {/* Main Row */}
                    <div className="px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        {/* Ticker & Company */}
                        <div className="w-48">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="text-[14px] font-medium text-white/90">{tickerSymbol}</div>
                            {isAlerted && (
                              <span className="text-[10px]">
                                {alert.alert_type === 'surge' ? '📈' : '📉'}
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-white/40">{item.stocks?.company_name || 'Loading...'}</div>
                        </div>

                        {/* Price */}
                        <div className="w-32">
                          <div className="text-[14px] font-medium text-white/90">
                            {price ? formatPrice(price.current_price) : 'Loading...'}
                          </div>
                        </div>

                        {/* Change */}
                        <div className="w-32">
                          {price ? (
                            <div
                              className={`text-[13px] font-medium ${
                                price.percent_change && price.percent_change > 0
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {formatPercent(price.percent_change)}
                            </div>
                          ) : (
                            <div className="text-[13px] text-white/40">-</div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 flex-1">
                          <div>
                            <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">High</div>
                            <div className="text-[13px] text-white/60">
                              {price ? formatPrice(price.day_high) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Low</div>
                            <div className="text-[13px] text-white/60">
                              {price ? formatPrice(price.day_low) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Volume</div>
                            <div className="text-[13px] text-white/60">
                              {price ? formatVolume(price.volume) : '-'}
                            </div>
                          </div>
                        </div>

                        {/* Alert Level */}
                        <div className="w-32">
                          <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Alert Level</div>
                          <div className="text-[13px] text-white/60">
                            {['Low', 'Med-Low', 'Medium', 'High', 'Critical'][item.alert_threshold - 1]} (±
                            {[5, 3, 2, 1, 0.5][item.alert_threshold - 1]}%)
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`/stocks/${tickerSymbol}`}
                          className="px-3 py-1.5 text-[13px] text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-md transition-all"
                        >
                          Details
                        </a>
                        <button
                          onClick={() => setSelectedStock(selectedStock === tickerSymbol ? null : tickerSymbol)}
                          className="px-3 py-1.5 text-[13px] text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-md transition-all"
                        >
                          {selectedStock === tickerSymbol ? 'Hide' : 'Chart'}
                        </button>
                        <button
                          onClick={() => handleRemoveStock(item.stock_id)}
                          className="px-3 py-1.5 text-[13px] text-white/30 hover:text-red-400 hover:bg-white/[0.06] rounded-md transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Chart Section */}
                    {selectedStock === tickerSymbol && (
                      <div className="border-t border-white/[0.06] px-6 py-6">
                        <TradingViewChart symbol={tickerSymbol} height="400" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
