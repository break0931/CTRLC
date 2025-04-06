
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Filter, RefreshCw, AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
const Subscribe = () => {


  const { data: session } = useSession();
  const [bots, setBots] = useState([]);

  const fetchSubscribed = async () => {
    console.log(session?.user?.id)
    try {
      const response = await fetch("/api/subscribed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session?.user?.id }),

      });

      const result = await response.json();
      setBots(result);
      
    } catch (error) {
      console.log("Error", error)
    }
  }
  console.log(bots);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscribed();
    }
  }, [session, JSON.stringify(bots)]);

  const updateStatus = (sub_id, newStatus) => {
    setBots(prevBots =>
      prevBots.map(bot =>
        bot.sub_id === sub_id ? { ...bot, status: newStatus } : bot
      )
    );
  };

  const stopStrategy = async (sub_id) => {
    try {
      const response = await fetch("/api/unSubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub_id: sub_id })
      })

      if (!response.ok) {
        alert("Failed to stop strategy.");
      }

      updateStatus(sub_id, "inactive");
    }
    catch (error) {
      console.log("error", error);
    }
  }















  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("botName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setAnimate(true);

    // Simulate refresh delay
    setTimeout(() => {
      setAnimate(false);
      setIsRefreshing(false);
    }, 800);
  };

  // Filter and sort bots
  const filteredAndSortedBots = bots
    .filter(bot => {
      const statusMatch = selectedStatus === "All" || bot.status === selectedStatus;
      const searchMatch = searchTerm === "" ||
        bot.mt5_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // bot.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.mt5_id.includes(searchTerm) ||
        bot.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.strategy_name.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "botName") {
        comparison = a.mt5_name.localeCompare(b.botName);
      } else if (sortBy === "todayPNL") {
        comparison = a.todayPNL - b.todayPNL;
      } else if (sortBy === "cumulativePNL") {
        comparison = a.cumulativePNL - b.cumulativePNL;
      } else if (sortBy === "balance") {
        comparison = a.balance - b.balance;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    refreshData();
  };

  const renderPNLColor = (value) => {
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  const renderStatusColor = (status) => {
    return status === "Active" ? "text-green-400" : "text-red-400";
  };

  const renderPNLBadge = (value) => {
    return (
      <span className={`inline-flex items-center font-medium rounded-full px-2.5 py-0.5 text-sm ${value >= 0 ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
        {value >= 0 ? "+" : ""}{value.toFixed(2)}
      </span>
    );
  };

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);


  // This effect handles clicks outside the menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Trading Bots</h1>
              <p className="text-gray-400">Manage and monitor your automated trading strategies</p>
            </div>

            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <button
                onClick={refreshData}
                className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Filter size={18} className="mr-2" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search bots..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
                <select
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                >
                  <option value="botName-asc">Bot Name (A-Z)</option>
                  <option value="botName-desc">Bot Name (Z-A)</option>
                  <option value="todayPNL-desc">Today's PNL (Highest)</option>
                  <option value="todayPNL-asc">Today's PNL (Lowest)</option>
                  <option value="cumulativePNL-desc">Cumulative PNL (Highest)</option>
                  <option value="cumulativePNL-asc">Cumulative PNL (Lowest)</option>
                  <option value="balance-desc">Balance (Highest)</option>
                  <option value="balance-asc">Balance (Lowest)</option>
                </select>
              </div>
            </div>
          )}

          <div className={`space-y-4 transition-opacity duration-500 ${animate ? "opacity-30" : "opacity-100"}`}>
            {filteredAndSortedBots.length > 0 ? (
              filteredAndSortedBots.map((bot, idx) => (
                <div
                  key={idx}
                  className="w-full border border-gray-500 p-5 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 hover:border-cyan-500 bg-gray-800"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full  ${bot.status === "active" ? "bg-green-500" : "bg-red-500"}`}></div>

                      <h3 className="font-bold text-xl text-white">{bot.mt5_name}</h3>
                    </div>


                    <div className="flex items-center mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${bot.status === "active" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                        {bot.status}
                      </span>

                      {/* Dropdown container - each bot has its own container */}
                      <div className="relative ml-2">
                        {/* Menu Icon Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === bot.sub_id ? null : bot.sub_id);
                          }}
                          className="p-1 rounded hover:bg-gray-700 flex items-center justify-center"
                          aria-label="Menu"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#ffffff"
                          >
                            <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === bot.sub_id && (
                          <div className="absolute right-0 mt-2 w-40 bg-gray-800 shadow-lg rounded-lg border border-gray-700 p-2 text-white z-50">
                            <Link href={`/subscribed/${bot.sub_id}`} passHref>
                              <div
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              >
                                <TrendingUp size={18} className="text-cyan-500" />
                                <span className="ml-2">View Stats</span>
                              </div>
                            </Link>

                            <div
                              className={`w-full text-left px-3 py-2 rounded flex items-center transition-colors ${bot.status === "active"
                                ? "text-red-400 hover:bg-gray-700 cursor-pointer"
                                : "text-gray-500 cursor-not-allowed"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (bot.status === "active") {
                                  alert("Stop strategy!");
                                  setOpenMenuId(null);
                                  stopStrategy(bot.sub_id);
                                }
                              }}
                            >
                              <AlertCircle size={18} />
                              <span className="ml-2">Stop</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 ">
                    <div>
                      <div className="text-gray-400 text-sm">Start Date</div>
                      <div className="font-semibold text-white">{bot.start_date.split("T")[0]}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">End Date</div>
                      <div className="font-semibold text-white">{bot.end_date?.split("T")[0]}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 bg-gray-900 p-4 border border-gray-700 rounded-lg">

                    <div>
                      <div className="text-gray-400 text-sm">MT5_id</div>
                      <div className="font-semibold text-white">{bot.mt5_id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Strategy</div>
                      <div className="font-semibold text-white">{bot.strategy_name}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm">Symbol</div>
                      <div className="font-semibold text-white">{bot.symbol}</div>
                    </div>


                  </div>

                  {/* <div className="bg-gray-900 p-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-700">
                    <div className="flex items-center">
                      <DollarSign size={18} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-gray-400 text-sm">Today's PNL</div>
                        
                        <div className={`font-bold ${renderPNLColor(111)}`}>
                          {renderPNLBadge(-632)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <TrendingUp size={18} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-gray-400 text-sm">Cumulative PNL</div>
                      
                        <div className={`font-bold ${renderPNLColor(111)}`}>
                          {renderPNLBadge(6322)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Activity size={18} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-gray-400 text-sm">Unrealized PNL</div>
                     

                        <div className={`font-bold ${renderPNLColor(111)}`}>
                          {renderPNLBadge(632)}
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-800 rounded-xl border border-gray-700">
                <AlertCircle size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No trading bots found</h3>
                <p className="text-gray-400 max-w-md">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Bot Button - Matching MainPage styling */}
        {/* <div className="flex justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center">
            Add New Trading Bot <TrendingUp className="ml-2 h-5 w-5" />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Subscribe;