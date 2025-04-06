
'use client'
import React, { useState, useEffect } from "react";

import MyChart from "../components/Mycharts";
import ReactECharts from 'echarts-for-react';
import AccountMenu from "../components/AccountMenu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { TrendingUp, CandlestickChart, Users, Percent, ChevronRight, Clock, ArrowUpRight } from 'lucide-react';

function Dashboard() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])
    const [mt5accounts, setMt5accounts] = useState([]);

    const [selectedType, setSelectedType] = useState("All");
    const filteredAccounts =
        selectedType === "All"
            ? mt5accounts
            : mt5accounts.filter((account) => account.account_type === selectedType);

    const { data: session } = useSession();



    const [hasFetchedAccounts, setHasFetchedAccounts] = useState(true);

    // Fetch accounts on session change
    useEffect(() => {
        if(!session){
            return
        }
        const fetchMt5Account = async () => {
            try {
                const response = await fetch("/api/mt5account", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: session?.user?.id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();
                setMt5accounts(result);
                console.log("all mt5   ", mt5accounts);
                //setHasFetchedAccounts(true)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchMt5Account();

    }, [session]);  // Runs only when session is available



    const [fetchAccount , setfetchAccount] = useState(true);
    // Fetch trades when `mt5accounts` is updated (and not empty)
    useEffect(() => {

        if (mt5accounts.length > 0  && fetchAccount) {
            fetchAllTrades();
            setfetchAccount(false)
        }

    }, [mt5accounts]);  // Now, fetchAllTrades runs only when `mt5accounts` is fully updated

    console.log("mt5accounts  ", mt5accounts)
    const [accountinfo, setAccountinfo] = useState([]);

    const fetchStats = async (mt5AccountId) => { 
        let tradeHistory = null;
        let retries = 0;
        const maxRetries = 10; // Prevent infinite loop

        while (!tradeHistory || tradeHistory.mt5_id !== mt5AccountId) {
            try {
                console.log("call next api route ")
                const res = await fetch("/api/trade-history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mt5_id: mt5AccountId }),
                });

                 

                tradeHistory = await res.json();

                if (!tradeHistory || tradeHistory.mt5_id !== mt5AccountId) {
                    console.log(`No match for mt5_id ${mt5AccountId}, retrying...`);
                    await new Promise((resolve) => setTimeout(resolve, 300)); // Wait before retrying

                }

            } catch (error) {
                console.log(`Error fetching stats for MT5 account ${mt5AccountId}:`, error);
                return []; // Return empty array on failure
            }
        }
         
        if (hasFetchedAccounts) {
            setAccountinfo(prev => [...prev, tradeHistory]);
            setHasFetchedAccounts(false);
        }
        return tradeHistory.positions || []; // Return positions or an empty array
    };




    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));





    const [loading, setLoading] = useState();

    const [trades, setTrades] = useState([]);
    const fetchAllTrades = async () => {
        if (session?.user?.id && mt5accounts.length > 0) {
            setLoading(true);
            try {
                const allTradesArrays = await Promise.all(
                    mt5accounts.map(async (account) => {
                        try {
                            // Introduce a delay (for example, 500ms) before fetching stats
                            //await delay(100);

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










    const totalTrades = trades.length;
    const wins = trades.filter(trade => trade.profit > 0).length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;



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







    // Enhanced doughnut chart options with dark theme
    const optionDough = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: '{b}: ${c} ({d}%)',
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            textStyle: {
                color: '#e5e7eb'
            }
        },
        color: ['#0891b2', '#ef4444', '#eab308', '#22c55e', '#8b5cf6', '#ec4899'],
        series: [
            {
                name: 'Performance',
                type: 'pie',
                radius: ['45%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false
                },
                emphasis: {
                    scale: true,
                    scaleSize: 10
                },
                labelLine: {
                    show: false
                },
                data: mt5accounts.map(account => {
                    // Find matching account info
                    const matchingAccountInfo = accountinfo.find(info => info.mt5_id === account.mt5_id);
                    return {
                        value: matchingAccountInfo ? matchingAccountInfo.balance : 0,
                        name: `Account ${account.mt5_id}`
                    };
                })
            }
        ]
    };



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

    console.log("accountinfo  ", accountinfo)
    console.log("trades  ", trades)

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section with animated gradient overlay */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-70"></div>
              

                {/* Animated dots/grid pattern for tech feel */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                }}></div>

                <div className="relative py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                    Dashboard
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-300" />
                                    <span className="text-sm font-medium bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                        {new Date().toLocaleString("en-US", {
                                            weekday: "long",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </span>
                                </div>
                            </div>
                            <p className="text-lg text-gray-300 mb-6">
                                Monitor your trading performance and account details
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {loading && isClient? (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
            ) : (

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Account Overview Card */}
                        <div className="lg:col-span-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500 transition-all duration-300">
                            <div className="p-5 border-b border-gray-700">
                                <h2 className="text-xl font-bold text-white">Account Overview</h2>
                                <p className="text-gray-300 font-medium mt-1">CTRLC Billionares</p>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="w-1/2 h-32">
                                        <ReactECharts option={optionDough} style={{ height: '100%', width: '100%' }} />
                                    </div>
                                    <div className="w-1/2 pl-4">
                                        <div className="flex flex-col space-y-1">
                                            <div className="text-2xl font-bold"> ${totalBalance.toFixed(2)}</div>
                                            {/* <div className="text-gray-300 font-medium">Today's PNL</div>
                                        <div className="text-green-400 font-bold flex items-center mt-1">
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                            +$986
                                        </div> */}
                                            <div>overview <span className="text-cyan-300">{mt5accounts.length}</span> accounts</div>
                                        </div>
                                        <Link href='/dashboard/stats'>
                                            <div className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-sm hover:underline mt-3 font-medium inline-flex items-center">
                                                View Analysis
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-gray-900 p-3 rounded-lg flex items-center space-x-2">
                                        <CandlestickChart className="w-5 h-5 text-cyan-400" />
                                        <div>
                                            <div className="text-xs text-gray-400">Total Trades</div>
                                            <div className="text-lg font-bold mt-1">{totalTrades}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 p-3 rounded-lg flex items-center space-x-2">
                                        <Percent className="w-5 h-5 text-cyan-400" />
                                        <div>
                                            <div className="text-xs text-gray-400">Win Rate</div>
                                            <div className="text-lg font-bold mt-1">{winRate.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profit Chart Card */}
                        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500 transition-all duration-300">
                            <div className="p-5 border-b border-gray-700">
                                <div className="flex justify-start items-center">
                                    <h2 className="text-xl font-bold text-white">Profit Trend</h2>
                                    
                                </div>
                            </div>
                            <div className="p-4">
                                <MyChart option={option} style={{ height: '300px' }} />
                            </div>
                        </div>
                    </div>

                    {/* MT5 Accounts Section */}
                    <div className="flex justify-between items-center mb-8 mt-10">
                        <h2 className="text-2xl font-bold">MT5 Accounts</h2>
                        <div className="flex items-center space-x-2">
                            <select
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-white focus:outline-none focus:border-cyan-500"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="All">All Accounts</option>
                                <option value="master">Master</option>
                                <option value="subscriber">Subscriber</option>
                            </select>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAccounts.map((account, index) => {
                            const accountData = accountinfo.find(info => info.mt5_id === account.mt5_id);

                            return (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500 transition-all duration-300"
                                >
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex space-x-2">
                                                <div className={`${account.account_type === 'master'
                                                    ? 'bg-green-700'
                                                    : 'bg-yellow-600'
                                                    } px-2 py-1 rounded text-xs font-medium text-white`}>
                                                    {account.account_type}
                                                </div>
                                                <div className="bg-gray-700 px-2 py-1 rounded text-xs font-medium text-white">MT5</div>
                                            </div>
                                            <AccountMenu id={account.mt5_id} />
                                        </div>

                                        <div className="text-white font-medium mt-2">{account.mt5_name}</div>
                                        <div className="text-gray-400 text-sm mt-1">ID: {account.mt5_id}</div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-2xl font-bold text-white">
                                                ${accountData ? accountData.balance : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <Link href="/addaccount" className="block">
                            <div className="border border-dashed border-gray-700 rounded-xl h-full min-h-[164px] flex flex-col justify-center items-center p-5 bg-gray-800 hover:bg-gray-700 hover:border-cyan-500 transition-all duration-300">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="text-white font-medium">Add MT5 Account</div>
                                <div className="text-gray-400 text-sm mt-1">Connect a new trading account</div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard