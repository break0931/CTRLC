'use client'
'use client'
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { BarChart2, ChevronRight, ChevronDown } from 'lucide-react';

const PriceChartPage = () => {
  const [activeSymbol, setActiveSymbol] = useState("OANDA:EUR_USD");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Predefined list of popular forex pairs
  const popularSymbols = [
    { name: "EUR/USD", symbol: "FX:EURUSD" },
    { name: "USD/JPY", symbol: "FX:USDJPY" },
    { name: "GBP/USD", symbol: "FX:GBPUSD" },
    { name: "USD/CHF", symbol: "FX:USDCHF" },
    { name: "AUD/USD", symbol: "FX:AUDUSD" },
    { name: "USD/CAD", symbol: "FX:USDCAD" },
    { name: "NZD/USD", symbol: "FX:NZDUSD" },
    { name: "Gold", symbol: "FX_IDC:XAUUSD" },
    { name: "Bitcoin", symbol: "COINBASE:BTCUSD" }
  ];

  const categoryGroups = {
    "Major Pairs": ["FX:EURUSD", "FX:USDJPY", "FX:GBPUSD", "OFXUSD_HF"],
    "Commodity Currencies": ["FX:AUDUSD", "FX:USDCAD", "FX:NZDUSD"],
    "Cryptocurrencies": ["COINBASE:BTCUSD", "COINBASE:ETHUSD"]
  };

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) return;

    new window.TradingView.widget({
      container_id: containerRef.current.id,
      symbol: activeSymbol,
      interval: "D",
      theme: "dark",
      style: "1",
      locale: "en",
      width: "100%",
      height: "600px",
      timezone: "Asia/Bangkok",
      studies: [
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      overrides: {
        "mainSeriesProperties.style": 1,
        "paneProperties.background": "#1f2937",
        "paneProperties.vertGridProperties.color": "#374151",
        "paneProperties.horzGridProperties.color": "#374151",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#9ca3af"
      }
    });
  }, [isScriptLoaded, activeSymbol]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
  

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-start mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart2 className="h-6 w-6 mr-2 text-cyan-400" /> 
            Forex Charts
          </h2>
        
        </div>

        {/* Symbol Selector with Dropdown */}
        <div className="relative mb-6">
          {/* Category Dropdown */}
          <div className="relative mb-4">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors"
            >
              Select Symbol Category
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                {Object.entries(categoryGroups).map(([category, symbols]) => (
                  <div key={category} className="p-2">
                    <div className="text-xs text-gray-400 px-2 py-1 border-b border-gray-700 mb-2">{category}</div>
                    <div className="flex flex-wrap gap-2">
                      {symbols.map((symbol) => {
                        const pair = popularSymbols.find(p => p.symbol === symbol);
                        return pair ? (
                          <button
                            key={symbol}
                            onClick={() => {
                              setActiveSymbol(symbol);
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                              activeSymbol === symbol 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {pair.name}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Scroll of Symbols */}
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {popularSymbols.map((item) => (
              <button
                key={item.symbol}
                onClick={() => setActiveSymbol(item.symbol)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                  activeSymbol === item.symbol 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* TradingView Chart Container */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <Script
            src="https://s3.tradingview.com/tv.js"
            strategy="lazyOnload"
            onLoad={() => setIsScriptLoaded(true)}
          />
          <div ref={containerRef} id="tradingview_chart" className="w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default PriceChartPage;
