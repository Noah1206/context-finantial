'use client'

import { useState, useEffect } from 'react'
import TradingViewChart from '@/components/TradingViewChart'
import Header from '@/components/Header'

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY')
  const [timeframe, setTimeframe] = useState('D')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  // Popular symbols to track
  const marketIndices = [
    { symbol: 'SPY', name: 'S&P 500 ETF', category: 'Index' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'Index' },
    { symbol: 'DIA', name: 'Dow Jones ETF', category: 'Index' },
    { symbol: 'IWM', name: 'Russell 2000 ETF', category: 'Index' },
  ]

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', category: 'Tech' },
    { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Auto' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Tech' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Tech' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Tech' },
    { symbol: 'AMZN', name: 'Amazon.com', category: 'Tech' },
    { symbol: 'META', name: 'Meta Platforms', category: 'Tech' },
    { symbol: 'AMD', name: 'AMD Inc.', category: 'Tech' },
  ]

  const timeframes = [
    { value: '1', label: '1m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '60', label: '1h' },
    { value: 'D', label: '1D' },
    { value: 'W', label: '1W' },
    { value: 'M', label: '1M' },
  ]

  // Mock real-time price data
  const mockPrices: Record<string, { price: string; change: string; changePercent: string; isPositive: boolean }> = {
    'SPY': { price: '478.34', change: '+4.08', changePercent: '+0.85%', isPositive: true },
    'QQQ': { price: '401.14', change: '+4.93', changePercent: '+1.23%', isPositive: true },
    'DIA': { price: '375.45', change: '+1.62', changePercent: '+0.43%', isPositive: true },
    'IWM': { price: '195.22', change: '+2.15', changePercent: '+1.11%', isPositive: true },
    'AAPL': { price: '185.92', change: '+3.38', changePercent: '+1.85%', isPositive: true },
    'TSLA': { price: '248.50', change: '+7.75', changePercent: '+3.21%', isPositive: true },
    'NVDA': { price: '495.22', change: '+26.58', changePercent: '+5.67%', isPositive: true },
    'MSFT': { price: '378.91', change: '+7.95', changePercent: '+2.14%', isPositive: true },
    'GOOGL': { price: '141.80', change: '+1.33', changePercent: '+0.95%', isPositive: true },
    'AMZN': { price: '153.41', change: '+2.23', changePercent: '+1.47%', isPositive: true },
    'META': { price: '352.68', change: '-4.38', changePercent: '-1.23%', isPositive: false },
    'AMD': { price: '118.34', change: '+3.33', changePercent: '+2.89%', isPositive: true },
  }

  const currentPrice = mockPrices[selectedSymbol] || mockPrices['SPY']

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header title="Charts" />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Symbol Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Market Indices */}
            <div>
              <h3 className="text-[11px] font-medium text-white/30 mb-3 uppercase tracking-wider">Market Indices</h3>
              <div className="space-y-1">
                {marketIndices.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all ${
                      selectedSymbol === item.symbol
                        ? 'bg-white/[0.09] text-white/90'
                        : 'text-white/50 hover:bg-white/[0.06] hover:text-white/90'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[13px] font-medium">{item.symbol}</div>
                        <div className="text-[11px] text-white/30">{item.name}</div>
                      </div>
                      {mockPrices[item.symbol] && (
                        <div className={`text-[11px] font-medium ${
                          mockPrices[item.symbol].isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {mockPrices[item.symbol].changePercent}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Stocks */}
            <div>
              <h3 className="text-[11px] font-medium text-white/30 mb-3 uppercase tracking-wider">Popular Stocks</h3>
              <div className="space-y-1">
                {popularStocks.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all ${
                      selectedSymbol === item.symbol
                        ? 'bg-white/[0.09] text-white/90'
                        : 'text-white/50 hover:bg-white/[0.06] hover:text-white/90'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[13px] font-medium">{item.symbol}</div>
                        <div className="text-[11px] text-white/30">{item.name}</div>
                      </div>
                      {mockPrices[item.symbol] && (
                        <div className={`text-[11px] font-medium ${
                          mockPrices[item.symbol].isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {mockPrices[item.symbol].changePercent}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Add to Watchlist */}
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-lg p-4">
              <div className="text-[13px] font-medium text-white/70 mb-2">Track {selectedSymbol}</div>
              <p className="text-[12px] text-white/40 mb-3">
                Add to your watchlist to receive alerts
              </p>
              <a
                href="/watchlist"
                className="block w-full px-3 py-2 bg-white/[0.09] hover:bg-white/[0.13] text-center text-[13px] text-white/90 font-medium rounded-md transition-all"
              >
                Add to watchlist
              </a>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Header */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-[20px] font-medium text-white/90">{selectedSymbol}</h2>
                    <span className="text-[13px] text-white/40">
                      {popularStocks.find(s => s.symbol === selectedSymbol)?.name ||
                       marketIndices.find(s => s.symbol === selectedSymbol)?.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <div className="text-[28px] font-medium text-white/90">
                      ${currentPrice.price}
                    </div>
                    <div className={`flex items-center gap-2 text-[14px] font-medium ${
                      currentPrice.isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <span>{currentPrice.change}</span>
                      <span>({currentPrice.changePercent})</span>
                    </div>
                  </div>
                </div>

                {/* Timeframe Selector */}
                <div className="flex gap-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                        timeframe === tf.value
                          ? 'bg-white/[0.13] text-white/90'
                          : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09] hover:text-white/90'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Market Status */}
              <div className="flex items-center gap-4 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  <span className="text-white/50">Market open</span>
                </div>
                {currentTime && (
                  <div className="text-white/30">
                    {currentTime}
                  </div>
                )}
              </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
              <TradingViewChart
                symbol={selectedSymbol}
                height="600"
                interval={timeframe}
              />
            </div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Day's Range</div>
                <div className="text-[14px] font-medium text-white/90">$475.20 - $479.85</div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Volume</div>
                <div className="text-[14px] font-medium text-white/90">52.3M</div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                <div className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Market Cap</div>
                <div className="text-[14px] font-medium text-white/90">$2.95T</div>
              </div>
            </div>

            {/* Technical Indicators Info */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
              <h3 className="text-[13px] font-medium text-white/50 mb-6 uppercase tracking-wider">Technical Analysis</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[12px] text-white/40 mb-1">Moving Averages</div>
                  <div className="text-[14px] font-medium text-emerald-400">Bullish (Strong Buy)</div>
                </div>
                <div>
                  <div className="text-[12px] text-white/40 mb-1">RSI (14)</div>
                  <div className="text-[14px] font-medium text-white/70">58.4 (Neutral)</div>
                </div>
                <div>
                  <div className="text-[12px] text-white/40 mb-1">MACD</div>
                  <div className="text-[14px] font-medium text-emerald-400">Bullish Signal</div>
                </div>
                <div>
                  <div className="text-[12px] text-white/40 mb-1">Bollinger Bands</div>
                  <div className="text-[14px] font-medium text-white/70">Mid-Range</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
