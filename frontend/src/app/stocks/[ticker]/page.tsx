'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface KeyMetrics {
  ticker: string
  company_name: string
  sector: string
  industry: string
  market_cap: number
  pe_ratio: number
  forward_pe: number
  peg_ratio: number
  price_to_book: number
  dividend_yield: number
  profit_margin: number
  operating_margin: number
  return_on_equity: number
  return_on_assets: number
  revenue: number
  revenue_per_share: number
  earnings_per_share: number
  beta: number
  '52_week_high': number
  '52_week_low': number
  '50_day_average': number
  '200_day_average': number
}

interface IncomeStatement {
  ticker: string
  period: string
  data: Record<string, Record<string, number | null>>
}

interface HistoricalPrice {
  date: string
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
}

interface HistoricalData {
  ticker: string
  start_date: string
  end_date: string
  interval: string
  data: HistoricalPrice[]
}

type ViewMode = 'chart' | 'table'

export default function StockDetailPage() {
  const params = useParams()
  const ticker = (params.ticker as string).toUpperCase()

  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'balance' | 'cashflow' | 'historical'>('overview')
  const [period, setPeriod] = useState<'annual' | 'quarterly'>('annual')
  const [interval, setInterval] = useState<'1d' | '1wk' | '1mo'>('1d')
  const [viewMode, setViewMode] = useState<ViewMode>('chart')

  const [metrics, setMetrics] = useState<KeyMetrics | null>(null)
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<any>(null)
  const [cashFlow, setCashFlow] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch key metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/stocks/${ticker}/metrics`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setMetrics(data)
        }
      } catch (err) {
        setError('Failed to fetch metrics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [ticker])

  // Fetch income statement
  useEffect(() => {
    if (activeTab === 'income') {
      const fetchIncomeStatement = async () => {
        try {
          setLoading(true)
          const response = await fetch(`http://localhost:8000/api/stocks/${ticker}/income-statement?period=${period}`)
          const data = await response.json()
          setIncomeStatement(data)
        } catch (err) {
          console.error('Failed to fetch income statement', err)
        } finally {
          setLoading(false)
        }
      }
      fetchIncomeStatement()
    }
  }, [ticker, period, activeTab])

  // Fetch balance sheet
  useEffect(() => {
    if (activeTab === 'balance') {
      const fetchBalanceSheet = async () => {
        try {
          setLoading(true)
          const response = await fetch(`http://localhost:8000/api/stocks/${ticker}/balance-sheet?period=${period}`)
          const data = await response.json()
          setBalanceSheet(data)
        } catch (err) {
          console.error('Failed to fetch balance sheet', err)
        } finally {
          setLoading(false)
        }
      }
      fetchBalanceSheet()
    }
  }, [ticker, period, activeTab])

  // Fetch cash flow
  useEffect(() => {
    if (activeTab === 'cashflow') {
      const fetchCashFlow = async () => {
        try {
          setLoading(true)
          const response = await fetch(`http://localhost:8000/api/stocks/${ticker}/cash-flow?period=${period}`)
          const data = await response.json()
          setCashFlow(data)
        } catch (err) {
          console.error('Failed to fetch cash flow', err)
        } finally {
          setLoading(false)
        }
      }
      fetchCashFlow()
    }
  }, [ticker, period, activeTab])

  // Fetch historical prices
  useEffect(() => {
    if (activeTab === 'historical') {
      const fetchHistoricalData = async () => {
        try {
          setLoading(true)
          const response = await fetch(`http://localhost:8000/api/stocks/${ticker}/historical?interval=${interval}`)
          const data = await response.json()
          setHistoricalData(data)
        } catch (err) {
          console.error('Failed to fetch historical data', err)
        } finally {
          setLoading(false)
        }
      }
      fetchHistoricalData()
    }
  }, [ticker, interval, activeTab])

  const formatNumber = (num: number | null | undefined, decimals = 2) => {
    if (num === null || num === undefined) return 'N/A'

    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(decimals)}T`
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(decimals)}B`
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(decimals)}M`
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(decimals)}K`
    }
    return `$${num.toFixed(decimals)}`
  }

  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A'
    return `${(num * 100).toFixed(2)}%`
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white">Loading {ticker} data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-medium mb-2 text-white/90">{metrics?.company_name || ticker}</h1>
          <div className="flex gap-3 text-[13px] text-white/40">
            <span>{ticker}</span>
            <span>•</span>
            <span>{metrics?.sector}</span>
            <span>•</span>
            <span>{metrics?.industry}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/[0.06]">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'income', label: 'Income Statement' },
            { id: 'balance', label: 'Balance Sheet' },
            { id: 'cashflow', label: 'Cash Flow' },
            { id: 'historical', label: 'Historical Prices' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white/90 border-b-2 border-white/90'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard label="Market Cap" value={formatNumber(metrics.market_cap)} />
            <MetricCard label="P/E Ratio" value={metrics.pe_ratio?.toFixed(2) || 'N/A'} />
            <MetricCard label="Forward P/E" value={metrics.forward_pe?.toFixed(2) || 'N/A'} />
            <MetricCard label="PEG Ratio" value={metrics.peg_ratio?.toFixed(2) || 'N/A'} />
            <MetricCard label="Price to Book" value={metrics.price_to_book?.toFixed(2) || 'N/A'} />
            <MetricCard label="Dividend Yield" value={formatPercent(metrics.dividend_yield)} />
            <MetricCard label="Profit Margin" value={formatPercent(metrics.profit_margin)} />
            <MetricCard label="Operating Margin" value={formatPercent(metrics.operating_margin)} />
            <MetricCard label="ROE" value={formatPercent(metrics.return_on_equity)} />
            <MetricCard label="ROA" value={formatPercent(metrics.return_on_assets)} />
            <MetricCard label="Revenue" value={formatNumber(metrics.revenue)} />
            <MetricCard label="Revenue Per Share" value={`$${metrics.revenue_per_share?.toFixed(2) || 'N/A'}`} />
            <MetricCard label="Earnings Per Share" value={`$${metrics.earnings_per_share?.toFixed(2) || 'N/A'}`} />
            <MetricCard label="Beta" value={metrics.beta?.toFixed(2) || 'N/A'} />
            <MetricCard label="52 Week High" value={`$${metrics['52_week_high']?.toFixed(2) || 'N/A'}`} />
            <MetricCard label="52 Week Low" value={`$${metrics['52_week_low']?.toFixed(2) || 'N/A'}`} />
            <MetricCard label="50 Day Average" value={`$${metrics['50_day_average']?.toFixed(2) || 'N/A'}`} />
            <MetricCard label="200 Day Average" value={`$${metrics['200_day_average']?.toFixed(2) || 'N/A'}`} />
          </div>
        )}

        {/* Income Statement Tab */}
        {activeTab === 'income' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('annual')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    period === 'annual'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Annual
                </button>
                <button
                  onClick={() => setPeriod('quarterly')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    period === 'quarterly'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Quarterly
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'chart'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📊 Chart View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📋 Table View
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-white/60">Loading income statement...</div>
            ) : incomeStatement?.data ? (
              viewMode === 'chart' ? (
                <FinancialChart data={incomeStatement.data} title="Income Statement" />
              ) : (
                <FinancialTable data={incomeStatement.data} />
              )
            ) : (
              <div className="text-white/40">No income statement data available</div>
            )}
          </div>
        )}

        {/* Balance Sheet Tab */}
        {activeTab === 'balance' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('annual')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    period === 'annual'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Annual
                </button>
                <button
                  onClick={() => setPeriod('quarterly')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    period === 'quarterly'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Quarterly
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'chart'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📊 Chart View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📋 Table View
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-white/60">Loading balance sheet...</div>
            ) : balanceSheet?.data ? (
              viewMode === 'chart' ? (
                <FinancialChart data={balanceSheet.data} title="Balance Sheet" />
              ) : (
                <FinancialTable data={balanceSheet.data} />
              )
            ) : (
              <div className="text-white/40">No balance sheet data available</div>
            )}
          </div>
        )}

        {/* Cash Flow Tab */}
        {activeTab === 'cashflow' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('annual')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    period === 'annual'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Annual
                </button>
                <button
                  onClick={() => setPeriod('quarterly')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    period === 'quarterly'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Quarterly
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'chart'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📊 Chart View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📋 Table View
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-white/60">Loading cash flow...</div>
            ) : cashFlow?.data ? (
              viewMode === 'chart' ? (
                <FinancialChart data={cashFlow.data} title="Cash Flow" />
              ) : (
                <FinancialTable data={cashFlow.data} />
              )
            ) : (
              <div className="text-white/40">No cash flow data available</div>
            )}
          </div>
        )}

        {/* Historical Prices Tab */}
        {activeTab === 'historical' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setInterval('1d')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    interval === '1d'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setInterval('1wk')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    interval === '1wk'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setInterval('1mo')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    interval === '1mo'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  Monthly
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'chart'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📊 Chart View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-[13px] rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white/[0.09] text-white/90 border border-white/[0.08]'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  📋 Table View
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-white/60">Loading historical data...</div>
            ) : historicalData?.data ? (
              viewMode === 'chart' ? (
                <HistoricalPriceChart data={historicalData.data} />
              ) : (
                <HistoricalPriceTable data={historicalData.data} />
              )
            ) : (
              <div className="text-white/40">No historical data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
      <div className="text-[11px] text-white/40 mb-2 uppercase tracking-wider">{label}</div>
      <div className="text-[20px] font-medium text-white/90">{value}</div>
    </div>
  )
}

function FinancialChart({ data, title }: { data: Record<string, Record<string, number | null>>, title: string }) {
  const dates = Object.keys(data).sort()

  // Get key metrics to chart
  const keyMetrics = [
    'Total Revenue',
    'Gross Profit',
    'Operating Income',
    'Net Income',
    'Total Assets',
    'Total Liabilities Net Minority Interest',
    'Operating Cash Flow',
    'Free Cash Flow',
  ]

  // Prepare chart data
  const chartData = dates.map(date => {
    const entry: any = { date: date.substring(0, 7) } // YYYY-MM format

    keyMetrics.forEach(metric => {
      if (data[date][metric] !== undefined && data[date][metric] !== null) {
        entry[metric] = (data[date][metric]! / 1e9).toFixed(2) // Convert to billions
      }
    })

    return entry
  })

  const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6']

  return (
    <div className="space-y-8">
      {/* Revenue & Profit Chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
        <h3 className="text-[14px] font-medium text-white/90 mb-4">Revenue & Profitability (Billions $)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#ffffff40" style={{ fontSize: '12px' }} />
            <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {['Total Revenue', 'Gross Profit', 'Operating Income', 'Net Income'].map((metric, idx) => (
              chartData.some(d => d[metric]) && (
                <Bar key={metric} dataKey={metric} fill={colors[idx]} />
              )
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Assets & Liabilities Chart */}
      {chartData.some(d => d['Total Assets'] || d['Total Liabilities Net Minority Interest']) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
          <h3 className="text-[14px] font-medium text-white/90 mb-4">Assets & Liabilities (Billions $)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff40" style={{ fontSize: '12px' }} />
              <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {['Total Assets', 'Total Liabilities Net Minority Interest'].map((metric, idx) => (
                chartData.some(d => d[metric]) && (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={colors[idx + 4]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cash Flow Chart */}
      {chartData.some(d => d['Operating Cash Flow'] || d['Free Cash Flow']) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
          <h3 className="text-[14px] font-medium text-white/90 mb-4">Cash Flow (Billions $)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff40" style={{ fontSize: '12px' }} />
              <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {['Operating Cash Flow', 'Free Cash Flow'].map((metric, idx) => (
                chartData.some(d => d[metric]) && (
                  <Bar key={metric} dataKey={metric} fill={colors[idx + 6]} />
                )
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function FinancialTable({ data }: { data: Record<string, Record<string, number | null>> }) {
  const dates = Object.keys(data).sort().reverse()
  const allMetrics = new Set<string>()

  dates.forEach((date) => {
    Object.keys(data[date]).forEach((metric) => allMetrics.add(metric))
  })

  const metrics = Array.from(allMetrics)

  return (
    <div className="overflow-x-auto bg-white/[0.03] border border-white/[0.06] rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left p-4 text-[13px] text-white/90 font-medium sticky left-0 bg-[#0d0d0d] z-10">Item</th>
            {dates.map((date) => (
              <th key={date} className="text-right p-4 text-[13px] text-white/90 font-medium min-w-[120px]">
                {date}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, idx) => (
            <tr key={metric} className={idx % 2 === 0 ? 'bg-white/[0.02]' : ''}>
              <td className="p-4 text-[13px] text-white/70 sticky left-0 bg-inherit z-10">{metric}</td>
              {dates.map((date) => {
                const value = data[date][metric]
                return (
                  <td key={date} className="text-right p-4 text-[13px] text-white/50">
                    {value !== null && value !== undefined
                      ? value >= 1e9
                        ? `$${(value / 1e9).toFixed(2)}B`
                        : value >= 1e6
                        ? `$${(value / 1e6).toFixed(2)}M`
                        : value >= 1e3
                        ? `$${(value / 1e3).toFixed(2)}K`
                        : typeof value === 'number'
                        ? `${value.toFixed(2)}`
                        : value
                      : 'N/A'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HistoricalPriceChart({ data }: { data: HistoricalPrice[] }) {
  const chartData = data.map(d => ({
    date: d.date.substring(5), // MM-DD format
    close: d.close,
    volume: d.volume ? d.volume / 1e6 : null, // Convert to millions
  }))

  return (
    <div className="space-y-8">
      {/* Price Chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
        <h3 className="text-[14px] font-medium text-white/90 mb-4">Closing Price ($)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#ffffff40" style={{ fontSize: '12px' }} />
            <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line type="monotone" dataKey="close" stroke="#60a5fa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-6">
        <h3 className="text-[14px] font-medium text-white/90 mb-4">Volume (Millions)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#ffffff40" style={{ fontSize: '12px' }} />
            <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="volume" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function HistoricalPriceTable({ data }: { data: HistoricalPrice[] }) {
  return (
    <div className="overflow-x-auto bg-white/[0.03] border border-white/[0.06] rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left p-4 text-[13px] text-white/90 font-medium">Date</th>
            <th className="text-right p-4 text-[13px] text-white/90 font-medium">Open</th>
            <th className="text-right p-4 text-[13px] text-white/90 font-medium">High</th>
            <th className="text-right p-4 text-[13px] text-white/90 font-medium">Low</th>
            <th className="text-right p-4 text-[13px] text-white/90 font-medium">Close</th>
            <th className="text-right p-4 text-[13px] text-white/90 font-medium">Volume</th>
          </tr>
        </thead>
        <tbody>
          {data.map((price, idx) => (
            <tr key={price.date} className={idx % 2 === 0 ? 'bg-white/[0.02]' : ''}>
              <td className="p-4 text-[13px] text-white/70">{price.date}</td>
              <td className="text-right p-4 text-[13px] text-white/50">
                ${price.open?.toFixed(2) || 'N/A'}
              </td>
              <td className="text-right p-4 text-[13px] text-white/50">
                ${price.high?.toFixed(2) || 'N/A'}
              </td>
              <td className="text-right p-4 text-[13px] text-white/50">
                ${price.low?.toFixed(2) || 'N/A'}
              </td>
              <td className="text-right p-4 text-[13px] text-white/50">
                ${price.close?.toFixed(2) || 'N/A'}
              </td>
              <td className="text-right p-4 text-[13px] text-white/50">
                {price.volume?.toLocaleString() || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
