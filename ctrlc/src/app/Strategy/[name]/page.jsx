

'use client'
import React, { useState, useEffect, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import MyChart from '@/app/components/Mycharts'
import Link from 'next/link'
import { useParams } from "next/navigation"
import { Banknote, Zap, Percent, CandlestickChart, Award, Target, Users, ChevronRight, ArrowUpRight } from 'lucide-react'

function Dashboard() {
  const { name } = useParams()

  if (!name) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  const [strategies, setStrategies] = useState("")
  const [activeTimeframe, setActiveTimeframe] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [trade, setTrade] = useState([]);

  useEffect(() => {
    const fetchstrategyinfo = async () => {

      try {
        const response = await fetch("/api/strategyinfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name }),
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setStrategies(data)
        console.log("strategy   ", data)
      } catch (error) {
        console.error('Error fetching strategies:', error)
      }
    }
    fetchstrategyinfo()
  }, [name])


  useEffect(() => {
    if (strategies && strategies.mt5_id) {
      const fetchStats = async () => {
        setIsLoading(true)
        try {
          let tradeHistory = null;

          // Polling for the trade history until it matches the mt5_id
          while (!tradeHistory || tradeHistory.mt5_id !== strategies.mt5_id) {
            const res = await fetch("/api/trade-history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mt5_id: strategies.mt5_id }),
            });

            if (!res.ok) {
              throw new Error("Failed to fetch data");
            }

            tradeHistory = await res.json();

            if (!tradeHistory || tradeHistory.mt5_id !== strategies.mt5_id) {
              // No match or trade history not available, wait before retrying
              console.log("No match for mt5_id yet, retrying...");
              await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 1 second before retrying
            }
          }

          // If we got the correct trade history, set it to state
          setTrade(tradeHistory);
        } catch (err) {

        } finally {
          setIsLoading(false)
        }

      };

      fetchStats();
    }
  }, [strategies.mt5_id]);




  console.log(trade.positions)
  const { winRate, totalPnL, rrRatio, wins, losses, totalTrades } = useMemo(() => {
    console.log("ttttttttt", trade.positions)
    if (!trade?.positions || trade.positions.length === 0) {
      return { winRate: 0, totalPnL: 0, rrRatio: 0 };
    }

    let totalPnL = 0;
    let wins = 0;
    let losses = 0;
    let totalRisk = 0;
    let totalReward = 0;

    trade.positions.forEach((pos) => {
      const { profit, type } = pos;
      totalPnL = totalPnL + parseFloat(profit);



      if (profit > 0) {
        wins++;
        totalReward += parseFloat(profit);
      } 
      if (profit < 0) {
        losses++;
        totalRisk += Math.abs(parseFloat(profit));
      }

    
    });
    const totalTrades = trade.positions.length;
    
    const avgProfit = totalReward / wins 
    const avgLoss = totalRisk / losses
    
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const rrRatio = avgLoss > 0 ? avgProfit / avgLoss  : 0;


    return { winRate, totalPnL, rrRatio, wins, losses, totalTrades };
  }, [trade]);


  const formatDate = (dateTimeStr) => {
    const [date] = dateTimeStr.split(" ");
    const [year, month, day] = date.split(".");
    return `${year.slice(2)}/${month}/${day}`;
  };
  const cumulativeProfit = trade.positions && trade.positions.length > 0
    ? trade.positions.reduce((acc, { profit, time }, index) => {
      const profitValue = parseFloat(profit) || 0;
      const prevValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
      const cumulativeValue = prevValue + profitValue;

      acc.push({
        name: formatDate(time),
        value: cumulativeValue
      });

      return acc;
    }, [])
    : [];
  console.log(cumulativeProfit)

  const parseDate = (dateTimeStr) => {
    const [datePart] = dateTimeStr.split(" ");
    const [year, month, day] = datePart.split(".");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Calculate Trade Frequency
  const calculateTradeFrequency = useMemo(() => {
    if (!trade.positions) return { '7d': 0, '15d': 0, '30d': 0 };

    const now = new Date();
    const frequencies = { '7d': 0, '15d': 0, '30d': 0 };

    trade.positions.forEach(pos => {
      const tradeDate = parseDate(pos.time);
      const daysDiff = Math.floor((now.getTime() - tradeDate.getTime()) / (1000 * 3600 * 24));

      if (daysDiff <= 7) frequencies['7d']++;
      if (daysDiff <= 15) frequencies['15d']++;
      if (daysDiff <= 30) frequencies['30d']++;
    });

    return frequencies;
  }, [trade.positions]);
  // Calculate Daily PNL
  const calculateDailyPNL = useMemo(() => {
    if (!trade.positions || trade.positions.length === 0) return [];

    const dailyPNLMap = new Map();

    trade.positions.forEach(pos => {
      const date = parseDate(pos.time);
      const dateKey = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

      const profit = parseFloat(pos.profit);

      if (!dailyPNLMap.has(dateKey)) {
        dailyPNLMap.set(dateKey, {
          date: dateKey,
          totalProfit: profit,
          trades: 1
        });
      } else {
        const existingEntry = dailyPNLMap.get(dateKey);
        existingEntry.totalProfit += profit;
        existingEntry.trades += 1;
      }
    });

    return Array.from(dailyPNLMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [trade.positions]);


  // Dark theme chart options
  const option = {
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
      formatter: function (params) {
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
      data: cumulativeProfit.map(item => item.name),
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
        data: cumulativeProfit.map(item => item.value),
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
  const optionPNL = useMemo(() => ({
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
      formatter: function (params) {
        return `${params[0].name}: $${params[0].value.toFixed(2)}`
      },
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      borderColor: '#4b5563',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb'
      }
    },
    xAxis: {
      type: 'category',
      data: calculateDailyPNL.map(item => item.date),
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
        data: calculateDailyPNL.map(item => item.totalProfit),
        barWidth: '60%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: function (params) {
            return params.data >= 0 ? '#06b6d4' : '#ef4444'
          }
        }
      }
    ]
  }), [calculateDailyPNL]);
  // Updated Frequency chart option
  const optionFreq = useMemo(() => ({
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
      formatter: function (params) {
        return `${params[0].name}: ${params[0].value} trades`
      },
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      borderColor: '#4b5563',
      borderWidth: 1,
      textStyle: {
        color: '#e5e7eb'
      }
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
        data: [
          calculateTradeFrequency['7d'],
          calculateTradeFrequency['15d'],
          calculateTradeFrequency['30d']
        ],
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
  }), [calculateTradeFrequency]);



  const optionDough = {
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
          { value: wins, name: 'Won', itemStyle: { color: '#10b981' } },
          { value: losses, name: 'Lost', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  }

  const timeframeOptions = [
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: 'All', value: 'all' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with animated gradient overlay - matching the main page */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-70"></div>
        

        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Strategy Details
              </h1>
              <div className='flex space-x-6 border-b border-gray-700 pb-2'>
                <div className='cursor-pointer text-cyan-400 border-cyan-400 border-b-2 font-semibold py-2 px-1'>Stats</div>
                <Link href={`/Strategy/${name}/order/`}>
                  <div className='cursor-pointer hover:text-cyan-400 text-gray-300 font-medium py-2 px-1 transition-colors'>Orders</div>
                </Link>
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
            {/* Strategy Info Card */}
            <div className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'>
              <div className='p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>{strategies.name || "Strategy Name"}</h2>
                    <div className='flex items-center mt-2 space-x-2'>
                      <div className='w-8 h-8 bg-gray-700 rounded-full overflow-hidden'>
                        <img className='w-full h-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbWc7JBahO7-JwjRdbpKFoccdmAmZCBz-y6A&s" alt="Symbol" />
                      </div>
                      <span className='text-gray-300 font-medium'>{strategies.symbol || "BTC/USDT"}</span>
                    </div>
                  </div>
                  <Link href={`/copy/${name}`}>
                    <button className='bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/30 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg'>
                      Copy Strategy
                      <ArrowUpRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </Link>
                </div>

                <div className='grid grid-cols-2 gap-4 mb-6'>
                  <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                    <Zap className='text-yellow-400 mr-3' size={20} />
                    <div>
                      <p className='text-gray-400 text-sm'>Start Date</p>
                      <p className='text-white font-semibold'>{strategies.start_date.split('T')[0]}</p>
                    </div>
                  </div>

                  <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                    <Percent className='text-cyan-400 mr-3' size={20} />
                    <div>
                      <p className='text-gray-400 text-sm'>Commission</p>
                      <p className='text-white font-semibold'>{strategies.commission || "2"}%</p>
                    </div>
                  </div>

                  <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                    <Award className='text-green-400 mr-3' size={20} />
                    <div>
                      <p className='text-gray-400 text-sm'>Win Rate</p>
                      <p className='text-white font-semibold'>{winRate.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                    <Banknote className='text-red-400 mr-3' size={20} />
                    <div>
                      <p className='text-gray-400 text-sm'>PNL</p>
                      <p className='text-white font-semibold'>${totalPnL.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                    <Target className='text-purple-400 mr-3' size={20} />
                    <div>
                      <p className='text-gray-400 text-sm'>Risk Reward</p>
                      <p className='text-white font-semibold'>{rrRatio.toFixed(2)}</p>
                    </div>
                  </div>


                </div>

                <div className='bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700'>
                  <div className='flex justify-between items-center'>
                    <div className='bg-gray-800 rounded-lg p-3 border border-gray-700'>
                      <p className='text-gray-400 text-sm'>Total Trades</p>
                      <p className='text-white text-xl font-bold'>{totalTrades}</p>
                    </div>
                    <div className='h-24 w-24'>
                      <ReactECharts option={optionDough} style={{ height: '100%', width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <div className='bg-green-500 rounded-full w-3 h-3 mr-2'></div>
                      <p className='text-gray-300'>Trades Won</p>
                    </div>
                    <p className='text-white font-medium'>{wins} <span className='text-green-400'>({winRate.toFixed(2)}%)</span></p>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <div className='bg-red-500 rounded-full w-3 h-3 mr-2'></div>
                      <p className='text-gray-300'>Trades Lost</p>
                    </div>
                    <p className='text-white font-medium'>{losses} <span className='text-red-400'>({100 - winRate.toFixed(2)}%)</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className='xl:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden p-6'>
              <div className='mb-6'>
                <div className='flex items-center justify-start mb-4'>
                  <h3 className='text-lg font-semibold text-white'>Performance Overview</h3>

                </div>

                <div className='bg-gray-900 rounded-lg p-4 border border-gray-700'>
                  <MyChart option={option} style={{ height: '350px' }} />
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 bg-gray-900 rounded-lg p-4 border border-gray-700'>
                  <MyChart option={optionPNL} style={{ height: '280px' }} />
                </div>
                <div className='bg-gray-900 rounded-lg p-4 border border-gray-700'>
                  <MyChart option={optionFreq} style={{ height: '280px' }} />
                </div>
              </div>
            </div>
          </div>
        )}

       
      </div>
    </div>
  )
}

export default Dashboard