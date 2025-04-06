
'use client'
import React, { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Filter,
  Calendar,
  RefreshCw,
  Search,
  Users,
  DollarSign,
  Percent,
  BarChart2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'



const Order = () => {
  const { id } = useParams()

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0,
    avgProfit: 0
  });



  const filteredPositions = useMemo(() => {
    if (data) {
      return data.filter(position => position.comment === id);
    }
    return [];
  }, [data, id]);

 console.log("sub data 24"  , filteredPositions)

  const [isLoading, setIsLoading] = useState(true)

 const [subscribe,setSubscribe] = useState([]);
  useEffect(() => {
    const fetchSubscribesinfo = async () => {
      setIsLoading(true)

      try {
        const response = await fetch("/api/subscribedinfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id }),
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setSubscribe(data)

      } catch (error) {
        console.error('Error fetching strategies:', error)
      } finally {
        setIsLoading(false)

      }
    }
    fetchSubscribesinfo()

  
  }, [id])
  console.log("sub " ,subscribe)


  
  useEffect(() => {
    if (subscribe && subscribe.mt5_id) {
      const fetchStats = async () => {

        const res = await fetch("/api/trade-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mt5_id: subscribe.mt5_id }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        console.log("not error")
        const result = await res.json();
        console.log(result);
        setData(result.positions);
       
      };

      fetchStats();
    }
  }, [subscribe.mt5_id]);

  console.log(data)

  // State for filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [symbol, setSymbol] = useState("All")
  const [side, setSide] = useState("All")
  const [account, setAccount] = useState("All")
  const [botName, setBotName] = useState("All")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() =>{
    applyFilters(filteredPositions);
  },[data])


  // Centralized filtering function
  const applyFilters = (dataToFilter) => {
    const filtered = dataToFilter.filter(order => {
      // Date range filter
      const orderDate = new Date(order.timestamp || order.time);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      const dateFilter = (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate);

      // Symbol filter
      const symbolFilter = symbol === "All" || order.symbol === symbol;

      // Side filter
      const sideFilter = side === "All" || order.type === side;

      // Account filter
      const accountFilter = account === "All" || order.account === account;

      // Bot name filter
      const botNameFilter = botName === "All" || order.botName === botName;

      return dateFilter && symbolFilter && sideFilter && accountFilter && botNameFilter;
    });

    // Set filtered data
    setFilteredData(filtered.reverse());

    // Calculate summary statistics
    const totalProfit = filtered.reduce((sum, order) => sum + parseFloat(order.profit), 0);
    const winningTrades = filtered.filter(order => parseFloat(order.profit) > 0).length;
    const totalTrades = filtered.length;

    setSummaryStats({
      totalProfit: totalProfit.toFixed(2),
      winRate: totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0,
      totalTrades,
      avgProfit: totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : 0
    });
  };
  // Handle search
  const handleSearch = () => {
    console.log("Searching with filters:", { dateRange, symbol, side, account, botName })
    // Here you would fetch filtered data from your API
    applyFilters(filteredPositions)
  }

  // Handle reset filters
  const handleReset = () => {
    setDateRange({ start: '', end: '' })
    setSymbol("All")
    setSide("All")
    setAccount("All")
    setBotName("All")
  }

  // Pagination helpers
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      {/* Header with animated gradient overlay - matching the main page */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-70"></div>
        
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Subscribed Details
              </h1>
              <div className='flex space-x-6 border-b border-gray-700 pb-2'>
                <Link href={`/subscribed/${id}`} className="cursor-pointer hover:text-cyan-400 font-medium py-2 px-1 transition-all duration-300">
                  Stats
                </Link>
                <div className="cursor-pointer text-cyan-400 border-cyan-400 border-b-4 font-semibold py-2 px-1">
                  Orders
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center text-cyan-400 mb-2">
              <DollarSign className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Total Profit/Loss</span>
            </div>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${summaryStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summaryStats.totalProfit >= 0 ? '+' : ''}{summaryStats.totalProfit}
              </span>
              <span className="text-gray-400 ml-1">$</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center text-cyan-400 mb-2">
              <Percent className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${parseFloat(summaryStats.winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {summaryStats.winRate}
              </span>
              <span className="text-gray-400 ml-1">%</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center text-cyan-400 mb-2">
              <BarChart2 className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Total Trades</span>
            </div>
            <span className="text-3xl font-bold">{summaryStats.totalTrades}</span>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center text-cyan-400 mb-2">
              <TrendingUp className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Avg. Profit/Trade</span>
            </div>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${parseFloat(summaryStats.avgProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(summaryStats.avgProfit) >= 0 ? '+' : ''}{summaryStats.avgProfit}
              </span>
              <span className="text-gray-400 ml-1">$</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center text-cyan-400 mb-4">
            <Filter className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Date Range</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />

            </div>
            <div className='space-y-2'>
              <span className="flex items-center text-gray-500">to</span>
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            {/* Symbol */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Symbol</label>
              <select
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                <option value="All">All</option>
                <option value="EURUSD">EURUSD</option>
                <option value="XAUUSD">XAUUSD</option>
                <option value="GBPUSD">GBPUSD</option>
                <option value="USDJPY">USDJPY</option>
              </select>
            </div>

            {/* Side */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Side</label>
              <select
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                value={side}
                onChange={(e) => setSide(e.target.value)}
              >
                <option value="All">All</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

         
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 mr-2" /> Search
            </button>
            <button
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg font-medium hover:border-cyan-500 transition-all duration-300 flex items-center"
              onClick={handleReset}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Symbol</th>
                  
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Side</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Entry Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Exit Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Entry Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Exit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Profit</th>
                </tr>
              </thead>
              <tbody> 
                {paginatedData.map((order, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-700 cursor-pointer transition-colors duration-150 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3 text-sm">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.symbol}</td>
                  
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.type === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                        {order.type === 'BUY' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {order.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.entryTime}</td>
                    <td className="px-4 py-3 text-sm">{order.time}</td>
                    <td className="px-4 py-3 text-sm">{order.entryPrice}</td>
                    <td className="px-4 py-3 text-sm">{order.price}</td>
                    <td className="px-4 py-3 text-sm">{order.volume}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${order.profit > 0 ? 'text-green-400' : order.profit < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {order.profit > 0 ? '+' : ''}{(parseFloat(order.profit)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-900">
                  <td colSpan="9" className="px-4 py-3 font-bold text-right">Page Total:</td>
                  <td className={`px-4 py-3 font-bold ${summaryStats.totalProfit > 0 ? 'text-green-400' : summaryStats.totalProfit < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {summaryStats.totalProfit > 0 ? '+' : ''}{summaryStats.totalProfit}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center text-sm text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} orders
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order

