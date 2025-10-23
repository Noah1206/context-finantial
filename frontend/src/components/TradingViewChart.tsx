'use client'

import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  width?: string
  height?: string
  interval?: string  // Timeframe: 1, 5, 15, 60, D, W, M
}

export default function TradingViewChart({
  symbol,
  width = "100%",
  height = "500",
  interval = "D"  // Default to Daily
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ''

    // Create TradingView widget
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: symbol,  // Just use symbol without exchange prefix
          interval: interval,  // Use the interval prop
          timezone: 'America/New_York',
          theme: 'dark',  // Changed to dark theme
          style: '1',
          locale: 'en',
          toolbar_bg: '#000000',  // Black toolbar background
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current?.id || 'tradingview_chart',
          hide_side_toolbar: false,
          studies: [
            'MASimple@tv-basicstudies'
          ],
          // Additional dark theme settings
          loading_screen: { backgroundColor: '#000000' },
          overrides: {
            "paneProperties.background": "#000000",
            "paneProperties.backgroundType": "solid"
          }
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [symbol, interval])  // Re-render when symbol or interval changes

  return (
    <div className="tradingview-widget-container border-2 border-slate-700 rounded-lg overflow-hidden bg-black">
      <div
        ref={containerRef}
        id={`tradingview_${symbol}`}
        style={{ height: `${height}px`, width }}
      />
      <div className="tradingview-widget-copyright text-right py-1 px-2 bg-black border-t border-slate-800">
        <a
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          rel="noopener noreferrer"
          target="_blank"
          className="text-[10px] text-slate-600 hover:text-slate-400 transition"
        >
          Powered by TradingView
        </a>
      </div>
    </div>
  )
}
