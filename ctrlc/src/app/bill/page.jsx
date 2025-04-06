'use client'
import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Footer from '../components/Footer';
import { Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, Search, Download, Filter, ChevronRight, TrendingUp } from 'lucide-react';
import CheckoutButton from '../components/CheckoutButton';
import { useSession } from 'next-auth/react';

function Bill() {
  const { data: session } = useSession();
  console.log(session)

  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [bills, setBills] = useState([])
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch("/api/bills", {
          method: "POST",
          headers: { "Content-Type": 'application/json' },
          body: JSON.stringify({ user_id: session?.user?.id }),
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json()
        setBills(result)

      } catch (error) {
        console.error(error)
      }
    }
    if (session?.user?.id) {
      fetchBills()
    }

  }, [session])

  console.log("bills ", bills)

  const [selectedStatus, setSelectedStatus] = useState("All");

  const refreshData = () => {
    setIsLoading(true);
    setAnimate(true);

    // Simulate refresh delay
    setTimeout(() => {
      setAnimate(false);
      setIsLoading(false);
    }, 800);
  };

  // Filter by status and search term
  const filteredBills = bills
    .filter(bill =>
      (selectedStatus === "All" || bill.status === selectedStatus) &&
      (searchTerm === "" ||
        bill._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.mt5_id.toLowerCase().includes(searchTerm.toLowerCase())
        //bill.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // Calculate summary statistics
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = filteredBills
    .filter(bill => bill.status === 'Paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidAmount = filteredBills
    .filter(bill => bill.status === 'Unpaid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'Unpaid':
        return <Clock size={16} className="text-yellow-400" />;
      case 'Expired':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section with animated gradient overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-70"></div>
        

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Bill Commission</span>
            </h1>
            <p className="text-gray-300 mt-2">Manage and track all your billing transactions in one place</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Billing Overview</h2>
          <div className="flex space-x-2">
            {/* <button
              onClick={refreshData}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center border border-gray-700"
            >
              <Filter size={16} className="mr-2 text-cyan-400" />
              Advanced Filters
            </button> */}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bills</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-3 bg-blue-900 text-blue-400 rounded-full">
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(paidAmount)}</p>
              </div>
              <div className="p-3 bg-green-900 text-green-400 rounded-full">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-cyan-500 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unpaid</p>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(unpaidAmount)}</p>
              </div>
              <div className="p-3 bg-yellow-900 text-yellow-400 rounded-full">
                <Clock size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Table */}
          <div className="lg:w-2/3 w-full rounded-xl border border-gray-700 bg-gray-800">
            {/* Table header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div className="font-semibold text-white">
                Bill Details
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bills..."
                    className="pl-8 pr-3 py-2 w-48 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>

                <select
                  className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Table content */}
            <div className={`divide-y divide-gray-700 transition-opacity duration-300 ${animate ? "opacity-30" : "opacity-100"}`}>
              {/* Table Header Row */}
              <div className="hidden md:grid grid-cols-5 text-xs font-medium text-gray-400 bg-gray-800 px-4 py-3">
                <div>BILL ID</div>
                <div>MT5ACCOUNT</div>
                <div>CREATED</div>
                <div>DUE DATE</div>
                <div>AMOUNT</div>
              </div>

              {/* Table Rows */}
              {filteredBills.length > 0 ? (
                filteredBills.map((bill, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-y-2 md:gap-y-0 cursor-pointer hover:bg-gray-700 transition ${selectedBill?._id === bill._id ? 'bg-gray-700 border-l-4 border-cyan-500' : ''}`}
                    onClick={() => setSelectedBill(bill)}
                  >
                    <div className="flex md:block items-center justify-between ">
                      <div className="font-medium text-sm text-white truncate w-24">{bill._id}</div>
                      <div className="md:hidden text-xs font-medium bg-gray-700 py-1 px-2 rounded">
                        {bill.amount.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-300">{bill.mt5_id}</div>

                    <div className="text-sm text-gray-400">{bill.bill_created.split('T')[0]}</div>

                    <div className="text-sm text-gray-400">{bill.due_date.split('T')[0]}</div>

                    <div className="hidden md:flex justify-between items-center">
                      <span className="font-medium text-white">{bill.amount.toFixed(2)}</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(bill.status)}
                        <span className={`text-sm ${bill.status === 'Paid' ? 'text-green-400' :
                          bill.status === 'Unpaid' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                          {bill.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:hidden items-center space-x-1 text-xs">
                      {getStatusIcon(bill.status)}
                      <span className={`${bill.status === 'Paid' ? 'text-green-400' :
                        bill.status === 'Unpaid' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {bill.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle size={24} className="text-gray-500 mb-2" />
                  <h3 className="text-sm font-medium text-white">No bills found</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your filters or search
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment Info */}
          <div className="lg:w-1/3 w-full rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
            {selectedBill ? (
              <>
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
                  <div className="text-sm font-medium opacity-80 mb-1">Amount Due</div>
                  <div className="text-3xl font-bold">${selectedBill.amount}</div>
                  <div className="mt-2 flex items-center text-sm">
                    <Calendar size={14} className="mr-1 opacity-70" />
                    <span>Due: {selectedBill.due_date}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-5">
                    <div className="text-sm text-gray-400 mb-0.5">Bill ID</div>
                    <div className="font-medium text-white">{selectedBill._id}</div>
                  </div>
                  {/* 
                  <div className="mb-5">
                    <div className="text-sm text-gray-400 mb-0.5">Description</div>
                    <div className="font-medium text-white">{selectedBill.description}</div>
                  </div> */}

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <div className="text-sm text-gray-400 mb-0.5">MT5 account</div>
                      <div className="font-medium text-white">{selectedBill.mt5_id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-0.5">Sender</div>
                      <div className="font-medium text-white">{selectedBill.strategy_name}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <div className="text-sm text-gray-400 mb-0.5">Created</div>
                      <div className="font-medium text-white">{selectedBill.bill_created.split('T')[0]}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-0.5">Due</div>
                      <div className="font-medium text-white">{selectedBill.due_date.split('T')[0]}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-0.5">Status</div>
                    <div className={`font-medium flex items-center ${selectedBill.status === 'Paid' ? 'text-green-400' :
                      selectedBill.status === 'Unpaid' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                      {getStatusIcon(selectedBill.status)}
                      <span className="ml-1">{selectedBill.status}</span>
                    </div>
                  </div>
                  
                  {/* Added Fined section for Expired bills */}
                  {selectedBill.status === 'Expired' && (
                    <div className="mt-5 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                      <div className="text-sm text-red-400 font-medium mb-1">Fined</div>
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium">
                          {formatCurrency(selectedBill.amount * 0.1)} {/* Example fine calculation - 10% of amount */}
                        </div>
                        <div className="text-xs text-red-300">10% late penalty</div>
                      </div>
                      <div className="text-xs text-red-300 mt-1">Total due: {formatCurrency(selectedBill.amount * 1.1)}</div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 mt-6">
                    {selectedBill.status !== 'Paid' && (
                      // <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
                      //   Pay Now
                      // </button>
                      <CheckoutButton bill_id={selectedBill._id}></CheckoutButton>
                    )}
                   
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <DollarSign size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No Bill Selected</h3>
                <p className="text-sm text-gray-400">
                  Select a bill from the list to view details and payment options
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="mt-12 mb-6">
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-90"></div>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "url('/api/placeholder/1920/1080')",
              backgroundSize: "cover"
            }}></div>
            <div className="relative p-6 md:p-8">
              <div className="md:flex items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">Need help managing your bills?</h2>
                  <p className="text-gray-300 mb-0 md:max-w-xl">
                    Our advanced billing tools can help you automate payments and avoid late fees.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="w-full md:w-auto px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300">
                    Learn More <ChevronRight className="inline-block ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Bill;