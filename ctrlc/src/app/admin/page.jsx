'use client'
import React, { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ArrowUpRight, DollarSign, Users, Award } from 'lucide-react'
import { useSession } from 'next-auth/react';

import Container from '../components/Container'

function AdminDashboard() {


  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchStatDashboard = async () => {
      try {
        const response = await fetch("/api/admindashboard", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setDashboardData(result);
        console.log(result)
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchStatDashboard();
  }, []);

  if (!dashboardData) {
    return <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
  }

  return (
    <Container>
      <div className='min-h-screen py-6 '>
        {/* Dashboard Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
          <p className='text-gray-500 mt-2'>Analytics overview and performance metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <h2 className="text-3xl font-bold mt-1">${dashboardData.totalRevenue.toLocaleString()}</h2>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Customers</p>
                <h2 className="text-3xl font-bold mt-1">{dashboardData.totalCustomers.toLocaleString()}</h2>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Strategies</p>
                <h2 className="text-3xl font-bold mt-1">{dashboardData.activeStrategies}</h2>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.revenueGraph} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customers Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Customer Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.customerGrowthGraph} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Customers']} />
                <Bar dataKey="customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Strategies */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Top Strategies</h3>
            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
              {dashboardData.topStrategies.map((strategy, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition duration-150">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{strategy.name}</h4>
                    <span className="text-green-600 font-bold">+${strategy.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">{strategy.symbol}</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Top Customers</h3>
            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
              {dashboardData.topCustomers.map((customer, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition duration-150">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{customer.name}</h4>
                    <span className="text-green-600 font-bold">${customer.total.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{customer.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default AdminDashboard;
