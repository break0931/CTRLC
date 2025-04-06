'use client'
import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import Link from 'next/link'
import { useParams } from "next/navigation"
import { 
  TrendingUp, TrendingDown, Clock, Zap, Percent, 
  CandlestickChart, Award, Target, Users, ChevronRight, 
  ArrowUpRight, BarChart3, Wallet, Calendar, Signal
} from 'lucide-react'

function StatsPage({ pageType = 'strategy' }) {
  const { id } = useParams()
  
//   if (!id) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
//       </div>
//     )
//   }

  const [data, setData] = useState(null)
  const [activeTimeframe, setActiveTimeframe] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Different API endpoints based on pageType
        const endpoint = pageType === 'subscribed' 
          ? "/api/subscribedinfo" 
          : pageType === 'mt5account' 
            ? "/api/mt5accountstats" 
            : "/api/strategyinfo"
            
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id }),
        })
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        
        const fetchedData = await response.json()
        setData(fetchedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [id, pageType])

  // Sample chart data
  const performanceData = [
    { name: 'Day 1', value: 10 },
    { name: 'Day 2', value: 20 },
    { name: 'Day 3', value: 15 },
    { name: 'Day 4', value: 40 },
    { name: 'Day 5', value: 50 },
    { name: 'Day 6', value: 40 },
    { name: 'Day 7', value: 20 },
    { name: 'Day 8', value: 35 },
    { name: 'Day 9', value: 40 },
    { name: 'Day 10', value: 110 },
    { name: 'Day 11', value: 120 },
    { name: 'Day 12', value: 115 },
    { name: 'Day 13', value: 140 },
    { name: 'Day 14', value: 150 },
    { name: 'Day 15', value: 140 }
  ]

  // Dark theme chart options
  const performanceChartOption = {
    title: {
      text: 'Profit Performance',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e5e7eb'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}: $${params[0].value}`
      },
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      borderColor: '#4b5563',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: performanceData.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#4b5563'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#4b5563'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#374151'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        formatter: '${value}'
      }
    },
    series: [
      {
        name: 'Profit',
        type: 'line',
        data: performanceData.map(item => item.value),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(6, 182, 212, 0.5)'
            }, {
              offset: 1,
              color: 'rgba(6, 182, 212, 0.1)'
            }]
          }
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: {
          width: 3,
          color: '#06b6d4',
        },
        itemStyle: {
          color: '#06b6d4',
          borderColor: '#1f2937',
          borderWidth: 2
        }
      }
    ]
  }

  const dailyPnlOption = {
    title: {
      text: 'Daily PNL',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e5e7eb'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}: $${params[0].value}`
      },
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      borderColor: '#4b5563',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: {
        lineStyle: {
          color: '#4b5563'
        }
      },
      axisLabel: {
        color: '#9ca3af'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#4b5563'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#374151'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        formatter: '${value}'
      }
    },
    series: [
      {
        name: 'PNL',
        type: 'bar',
        data: [50, 200, 150, 80, 70, 110, -20],
        barWidth: '60%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: function(params) {
            return params.data >= 0 ? '#06b6d4' : '#ef4444'
          }
        }
      }
    ]
  }

  const tradeFrequencyOption = {
    title: {
      text: 'Trade Frequency',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e5e7eb'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}: ${params[0].value} trades`
      },
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      borderColor: '#4b5563',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['7 days', '15 days', '30 days'],
      axisLine: {
        lineStyle: {
          color: '#4b5563'
        }
      },
      axisLabel: {
        color: '#9ca3af'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#4b5563'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#374151'
        }
      },
      axisLabel: {
        color: '#9ca3af'
      }
    },
    series: [
      {
        name: 'Frequency',
        type: 'bar',
        data: [15, 67, 144],
        barWidth: '60%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#ef4444'
            }, {
              offset: 1,
              color: '#f87171'
            }]
          }
        }
      }
    ]
  }

  const winRatePieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      borderColor: '#4b5563',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb'
      }
    },
    legend: {
      show: false
    },
    series: [
      {
        name: 'Trades',
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#1f2937',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: [
          { value: 1187, name: 'Won', itemStyle: { color: '#10b981' } },
          { value: 312, name: 'Lost', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  }

  // Icons and labels based on page type
  const getPageConfig = () => {
    switch(pageType) {
      case 'subscribed':
        return {
          title: 'Subscription Details',
          icon: <Clock className='text-cyan-400 mr-3' size={20} />,
          subtitle: `Subscription #${id}`,
          navItems: [
            { label: 'Stats', href: `/subscribed/${id}`, active: true },
            { label: 'Orders', href: `/subscribed/${id}/orders`, active: false },
            { label: 'Settings', href: `/subscribed/${id}/settings`, active: false }
          ],
          metrics: [
            // Only showing relevant metrics for subscription
            { icon: <Calendar className='text-cyan-400 mr-3' size={20} />, label: 'Start Date', value: '01-02-2025' },
            { icon: <Target className='text-purple-400 mr-3' size={20} />, label: 'Risk Reward', value: '3.14' },
            { icon: <TrendingDown className='text-red-400 mr-3' size={20} />, label: 'Max Drawdown', value: '25%' },
            { icon: <Clock className='text-cyan-400 mr-3' size={20} />, label: 'Avg Hold Time', value: '3 hours' }
          ],
          button: { text: 'View Strategy', href: '/strategy/123' }
        }
      case 'mt5account':
        return {
          title: 'MT5 Account Stats',
          icon: <Signal className='text-green-400 mr-3' size={20} />,
          subtitle: `Account #${id}`,
          navItems: [
            { label: 'Overview', href: `/mt5account/${id}`, active: true },
            { label: 'History', href: `/mt5account/${id}/history`, active: false },
            { label: 'Symbols', href: `/mt5account/${id}/symbols`, active: false }
          ],
          metrics: [
            { icon: <Wallet className='text-green-400 mr-3' size={20} />, label: 'Balance', value: '$10,450' },
            { icon: <BarChart3 className='text-blue-400 mr-3' size={20} />, label: 'Equity', value: '$11,230' },
            { icon: <TrendingDown className='text-red-400 mr-3' size={20} />, label: 'Max Drawdown', value: '18%' },
            { icon: <Award className='text-yellow-400 mr-3' size={20} />, label: 'Win Rate', value: '72%' }
          ],
          button: { text: 'Manage Account', href: `/mt5account/${id}/manage` }
        }
      default: // strategy
        return {
          title: 'Strategy Details',
          icon: <CandlestickChart className='text-cyan-400 mr-3' size={20} />,
          subtitle: data?.name || 'Strategy Name',
          navItems: [
            { label: 'Performance', href: `/strategy/${id}`, active: true },
            { label: 'Trades', href: `/strategy/${id}/trades`, active: false },
            { label: 'Settings', href: `/strategy/${id}/settings`, active: false }
          ],
          metrics: [
            { icon: <Zap className='text-yellow-400 mr-3' size={20} />, label: 'Leverage', value: '500x' },
            { icon: <Percent className='text-cyan-400 mr-3' size={20} />, label: 'Commission', value: '2%' },
            { icon: <Award className='text-green-400 mr-3' size={20} />, label: 'Win Rate', value: '75%' },
            { icon: <Target className='text-purple-400 mr-3' size={20} />, label: 'Risk Reward', value: '3.14' },
            { icon: <TrendingDown className='text-red-400 mr-3' size={20} />, label: 'Max Drawdown', value: '25%' },
            { icon: <Clock className='text-cyan-400 mr-3' size={20} />, label: 'Avg Hold Time', value: '3 hours' }
          ],
          button: { text: 'Copy Strategy', href: `/copy/${id}` }
        }
    }
  }

  const pageConfig = getPageConfig()
  const timeframeOptions = [
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: 'All', value: 'all' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with animated gradient overlay - header color changes based on page type */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${
          pageType === 'subscribed' 
            ? 'from-indigo-800 to-blue-900' 
            : pageType === 'mt5account' 
              ? 'from-green-800 to-teal-900' 
              : 'from-blue-800 to-cyan-900'
        } opacity-70`}></div>
        
        {/* Animated dots/grid pattern for tech feel */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }}></div>
        
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {pageConfig.title}
              </h1>
              <div className='flex space-x-6 border-b border-gray-700 pb-2'>
                {pageConfig.navItems.map((item, index) => (
                  item.active ? (
                    <div key={index} className='cursor-pointer text-cyan-400 border-cyan-400 border-b-2 font-semibold py-2 px-1'>
                      {item.label}
                    </div>
                  ) : (
                    <Link key={index} href={item.href}>
                      <div className='cursor-pointer hover:text-cyan-400 text-gray-300 font-medium py-2 px-1 transition-colors'>
                        {item.label}
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Info Card */}
            <div className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'>
              <div className='p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>{pageConfig.subtitle}</h2>
                    {pageType === 'strategy' && (
                      <div className='flex items-center mt-2 space-x-2'>
                        <div className='w-8 h-8 bg-gray-700 rounded-full overflow-hidden'>
                          <img className='w-full h-full object-cover' src="/placeholder/symbol.png" alt="Symbol" />
                        </div>
                        <span className='text-gray-300 font-medium'>{data?.symbol || "BTC/USDT"}</span>
                      </div>
                    )}
                  </div>
                  <Link href={pageConfig.button.href}>
                    <button className='bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/30 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg'>
                      {pageConfig.button.text}
                      <ArrowUpRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </Link>
                </div>

                <div className='grid grid-cols-2 gap-4 mb-6'>
                  {pageConfig.metrics.map((metric, index) => (
                    <div key={index} className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                      {metric.icon}
                      <div>
                        <p className='text-gray-400 text-sm'>{metric.label}</p>
                        <p className='text-white font-semibold'>{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700'>
                  <div className='flex justify-between items-center'>
                    <div className='bg-gray-800 rounded-lg p-3 border border-gray-700'>
                      <p className='text-gray-400 text-sm'>Total Trades</p>
                      <p className='text-white text-xl font-bold'>1,499</p>
                    </div>
                    <div className='h-24 w-24'>
                      <ReactECharts option={winRatePieOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <div className='bg-green-500 rounded-full w-3 h-3 mr-2'></div>
                      <p className='text-gray-300'>Trades Won</p>
                    </div>
                    <p className='text-white font-medium'>1,187 <span className='text-green-400'>(79%)</span></p>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <div className='bg-red-500 rounded-full w-3 h-3 mr-2'></div>
                      <p className='text-gray-300'>Trades Lost</p>
                    </div>
                    <p className='text-white font-medium'>312 <span className='text-red-400'>(21%)</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className='xl:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden p-6'>
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-white'>Performance Overview</h3>
                  <div className='inline-flex bg-gray-900 rounded-lg p-1'>
                    {timeframeOptions.map(option => (
                      <button
                        key={option.value}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          activeTimeframe === option.value
                            ? 'bg-gray-800 text-cyan-400 border border-gray-700'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => setActiveTimeframe(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='bg-gray-900 rounded-lg p-4 border border-gray-700'>
                  <ReactECharts option={performanceChartOption} style={{ height: '350px' }} />
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 bg-gray-900 rounded-lg p-4 border border-gray-700'>
                  <ReactECharts option={dailyPnlOption} style={{ height: '280px' }} />
                </div>
                <div className='bg-gray-900 rounded-lg p-4 border border-gray-700'>
                  <ReactECharts option={tradeFrequencyOption} style={{ height: '280px' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-right">
          <Link href={pageType === 'subscribed' ? '/subscribed' : pageType === 'mt5account' ? '/mt5accounts' : '/strategies'}>
            <button className="text-cyan-400 flex items-center text-sm ml-auto">
              {pageType === 'subscribed' ? 'View All Subscriptions' : 
               pageType === 'mt5account' ? 'View All MT5 Accounts' : 
               'View All Strategies'} 
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StatsPage