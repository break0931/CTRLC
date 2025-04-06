
'use client'
import React, { useState, useEffect, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import MyChart from '@/app/components/Mycharts'
import Link from 'next/link'
import { useParams } from "next/navigation"
import { TrendingUp, TrendingDown, Clock, CircleDollarSign, Banknote, Wallet, BarChart3, Award, Target, Users, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useSession } from "next-auth/react";

function Stats() {
    //const [trade, setTrade] = useState([]);
    const { data: session } = useSession();

    const [mt5accounts, setMt5accounts] = useState([]);



    const [hasFetchedAccounts, setHasFetchedAccounts] = useState(true);

    useEffect(() => {
        if (!session) return; // Only run when session is available

        const fetchMt5Account = async () => {
            try {
                const response = await fetch("/api/mt5account", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: session?.user?.id }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const result = await response.json();
                setMt5accounts(result);
                console.log("all mt5   ", result);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchMt5Account();
    }, [session]);  // Runs only when session is available



    const [fetchAccount, setfetchAccount] = useState(true);
    // Fetch trades when `mt5accounts` is updated (and not empty)
    useEffect(() => {

        if (mt5accounts.length > 0 && fetchAccount) {
            fetchAllTrades();
            setfetchAccount(false)
        }

    }, [mt5accounts]);  // Now, fetchAllTrades runs only when `mt5accounts` is fully updated

    console.log("mt5accounts  ", mt5accounts)



    const [accountinfo, setAccountinfo] = useState([])
    const fetchStats = async (mt5AccountId) => {
        let tradeHistory = null;
        let retries = 0;
        const maxRetries = 10; // Prevent infinite loop

        while (!tradeHistory || tradeHistory.mt5_id !== mt5AccountId) {
            try {
                const res = await fetch("/api/trade-history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mt5_id: mt5AccountId }),
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch data for MT5 account ${mt5AccountId}`);
                }

                tradeHistory = await res.json();

                if (!tradeHistory || tradeHistory.mt5_id !== mt5AccountId) {
                    console.log(`No match for mt5_id ${mt5AccountId}, retrying...`);
                    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait before retrying

                }

            } catch (error) {
                console.error(`Error fetching stats for MT5 account ${mt5AccountId}:`, error);
                return []; // Return empty array on failure
            }
        }
        if (hasFetchedAccounts) {
            setAccountinfo(prev => [...prev, tradeHistory]);
            setHasFetchedAccounts(false);
        }
        return tradeHistory.positions || []; // Return positions or an empty array
    };


    // New utility functions for data processing
    const parseDate = (dateTimeStr) => {
        const [datePart] = dateTimeStr.split(" ");
        const [year, month, day] = datePart.split(".");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState([]);
    const fetchAllTrades = async () => {
        if (session?.user?.id && mt5accounts.length > 0) {
            setLoading(true);
            try {
                const allTradesArrays = await Promise.all(
                    mt5accounts.map(async (account) => {
                        try {

                            const trades = await fetchStats(account.mt5_id);
                            return trades || []; // Ensure it always returns an array
                        } catch (error) {
                            console.log(`Failed to fetch trades for account ${account.mt5_id}:`, error);
                            return []; // Return an empty array on failure to avoid breaking Promise.all
                        }
                    })
                );


                // Flatten and concatenate all trades
                const combinedTrades = allTradesArrays.flat();

                // Set combined trades
                setTrades(combinedTrades);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching trades:", error);
            }
        }
    };

    console.log(trades);

    // Calculate Daily PNL
    const calculateDailyPNL = useMemo(() => {
        if (!trades || trades.length === 0) return [];

        const dailyPNLMap = new Map();

        trades.forEach(pos => {
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
    }, [trades]);
    // Calculate Trade Frequency
    const calculateTradeFrequency = useMemo(() => {
        if (!trades) return { '7d': 0, '15d': 0, '30d': 0 };

        const now = new Date();
        const frequencies = { '7d': 0, '15d': 0, '30d': 0 };

        trades.forEach(pos => {
            const tradeDate = parseDate(pos.time);
            const daysDiff = Math.floor((now.getTime() - tradeDate.getTime()) / (1000 * 3600 * 24));

            if (daysDiff <= 7) frequencies['7d']++;
            if (daysDiff <= 15) frequencies['15d']++;
            if (daysDiff <= 30) frequencies['30d']++;
        });

        return frequencies;
    }, [trades]);



    const [activeTimeframe, setActiveTimeframe] = useState("7d")
    const { winRate, totalPnL, rrRatio, wins, losses, totalTrades } = useMemo(() => {
        console.log("ttttttttt", trades)
        if (!trades || trades.length === 0) {
            return { winRate: 0, totalPnL: 0, rrRatio: 0 };
        }

        let totalPnL = 0;
        let wins = 0;
        let losses = 0;
        let totalRisk = 0;
        let totalReward = 0;

        trades.forEach((pos) => {
            const { profit, type } = pos;
            totalPnL = totalPnL + parseFloat(profit);



            if (profit >= 0) {
                wins++;
                totalReward += parseFloat(profit);
            }
            if (profit < 0) {
                losses++;
                totalRisk += Math.abs(parseFloat(profit));
            }


        });
        const totalTrades = trades.length;

        const avgProfit = totalReward / wins
        const avgLoss = totalRisk / losses
       
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const rrRatio = avgLoss > 0 ? avgProfit / avgLoss : 0;

        console.log("avgProfit " , avgProfit)
        console.log("avgLoss " , avgLoss)
    
        return { winRate, totalPnL, rrRatio, wins, losses, totalTrades };
    }, [trades]);

 
    


    // Compute chart options dynamically
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






    const formatDate = (dateTimeStr) => {
        const [date] = dateTimeStr.split(" ");
        const [year, month, day] = date.split(".");
        return `${year.slice(2)}/${month}/${day}`;
    };

    const cumulativeProfit = trades && trades.length > 0
        ? trades.reduce((acc, { profit, time }, index) => {
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
                return `${params[0].name}: $${(params[0].value.toFixed(2))}`
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
    const totalBalance = accountinfo.reduce((sum, item) => sum + parseFloat(item.balance), 0);
    const totalEquity = accountinfo.reduce((sum, item) => sum + parseFloat(item.equity), 0);
    console.log("accountiinfo ", accountinfo)
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header with animated gradient overlay - matching the main page */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-70"></div>

                <div className="relative py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col space-y-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                Account Overview
                            </h1>
                            <div className='flex space-x-6 border-b border-gray-700 pb-2'>
                                <div className='cursor-pointer text-cyan-400 border-cyan-400 border-b-2 font-semibold py-2 px-1'>Stats</div>
                                {/* <Link href={`/mt5account/${id}/order/`}>
                                    <div className='cursor-pointer hover:text-cyan-400 text-gray-300 font-medium py-2 px-1 transition-colors'>Orders</div>
                                </Link> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {loading ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
                        {/* Strategy Info Card */}
                        <div className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'>
                            <div className='p-6'>
                                <div className='flex justify-between items-center mb-6'>
                                    <div className='space-y-2'>
                                        <h2 className='text-2xl font-bold text-white'>Account {session?.user?.name}</h2>
                                        <div className=''>

                                        </div>


                                    </div>

                                </div>

                                <div className='grid grid-cols-2 gap-4 mb-6'>
                                    <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                                        <Wallet className='text-green-400 mr-3' size={20} />
                                        <div>
                                            <p className='text-gray-400 text-sm'>Balance</p>
                                            <p className='text-white font-semibold'>${totalBalance.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                                        <BarChart3 className='text-blue-400 mr-3' size={20} />
                                        <div>
                                            <p className='text-gray-400 text-sm'>Equity</p>
                                            <p className='text-white font-semibold'>${totalEquity.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className='flex items-center p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-cyan-500 transition-all duration-300'>
                                        <Award className='text-yellow-400 mr-3' size={20} />
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
                                        <div className='bg-gray-800 rounded-lg p-3 border border-gray-700 text-center'>
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
                                        <p className='text-white font-medium'>{wins} <span className='text-green-400'> {totalTrades > 0
                                            ? `(${((wins / totalTrades) * 100).toFixed(2)}%)`
                                            : '(0.00%)'
                                        }</span></p>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <div className='flex items-center'>
                                            <div className='bg-red-500 rounded-full w-3 h-3 mr-2'></div>
                                            <p className='text-gray-300'>Trades Lost</p>
                                        </div>
                                        <p className='text-white font-medium'>{losses}  <span className='text-red-400'> {totalTrades > 0
                                            ? `(${((losses / totalTrades) * 100).toFixed(2)}%)`
                                            : '(0.00%)'
                                        }</span></p>
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

                <div className="mt-8 text-right">
                    <button className="text-cyan-400 flex items-center text-sm ml-auto">
                        View All Strategies <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Stats            