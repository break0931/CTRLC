
import React from 'react'
import { TrendingUp, Award, Users, BarChart2, Zap, ChevronRight, Star, Shield, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'


const MainPage = () => {

  const sample = [
    { name: "XAUUSD NEAT", profit: 1230, symbol: "XAUUSD" },
    { name: "USDJPY NEAT", profit: 452, symbol: "USDJPY" },
    { name: "GBPUSD NEAT", profit: 553, symbol: "GBPUSD" }


  ]
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Copy Elite Traders.</span>
                <span className="block mt-2">Amplify Your Returns.</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Follow top-performing traders and automatically replicate their strategies in real-time. Take the guesswork out of trading.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center">
                  Start Copy Trading <Zap className="ml-2 h-5 w-5" />
                </button>
                <button className="px-6 py-3 bg-gray-800 bg-opacity-70 rounded-lg font-medium border border-gray-700 hover:border-cyan-500 transition-all duration-300">
                  Explore Strategies
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-70"></div>
                <div className="relative bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Active Strategies</h3>
                    <span className="flex items-center text-xs px-2 py-1 bg-green-900 text-green-400 rounded-full">
                      <span className="h-2 w-2 bg-green-400 rounded-full mr-1 animate-pulse"></span> Live
                    </span>
                  </div>
                  <div className="space-y-4">
                    {sample.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg border border-gray-700 flex justify-between items-center">
                        <div className="flex items-center">

                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.symbol} </div>
                          </div>
                        </div>
                        <div className="text-green-400 text-sm font-medium">+${item.profit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* How It Works Section */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Copy Trading Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Follow top-performing traders and automatically replicate their trades in your own account in just three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl">1</div>
              <div className="mb-4 text-cyan-400">
                <BarChart2 className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with MT5</h3>
              <p className="text-gray-400">
              Easily connect your MT5 account on our platform,  and link them to your preferred strategies for seamless trade execution and real-time updates.              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl">2</div>
              <div className="mb-4 text-cyan-400">
                <Users className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Traders</h3>
              <p className="text-gray-400">
                Browse through our curated list of verified traders with proven track records and transparent performance metrics.
              </p>
            </div>


            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl">3</div>
              <div className="mb-4 text-cyan-400">
                <Zap className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Copy Trades</h3>
              <p className="text-gray-400">
                Our system automatically executes trades in your account, mirroring the actions of your selected Traders in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-90"></div>

            <div className="relative p-8 md:p-12">
              <div className="md:flex items-center justify-between">
                <div className="mb-8 md:mb-0 md:mr-8">
                  <h2 className="text-3xl font-bold mb-4">Ready to Start Copy Trading?</h2>
                  <p className="text-gray-300 mb-0 md:max-w-xl">
                    Join thousands of traders already profiting from the expertise of professionals. Create your account and start copying in minutes.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/addaccount">
                    <button className="w-full md:w-auto px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                      Get Started Now
                    </button>
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage