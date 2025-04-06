'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  PieChart, LineChart, ChevronDown, DollarSign, CreditCard, 
  User, LogOut, LogIn, Menu, X, AlertTriangle, ArrowRight
} from 'lucide-react';

const NavigationBar = () => {
  const { data: session } = useSession(); // Get session data
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: 'Strategy', icon: <PieChart className="h-5 w-5" />, link: "/Strategy", protected: false },
    { name: 'PriceChart', icon: <DollarSign className="h-5 w-5" />, link: "/pricechart", protected: false },
    { name: 'Subscribed', icon: <ChevronDown className="h-5 w-5" />, link: "/subscribed", protected: true },
    { name: 'Dashboard', icon: <LineChart className="h-5 w-5" />, link: "/dashboard", protected: true },
    { name: 'Bill', icon: <CreditCard className="h-5 w-5" />, link: "/bill", protected: true },
  ];

  // Handle navigation to protected routes
  const handleNavigation = (e, link, isProtected) => {
    if (isProtected && !session) {
      e.preventDefault();
      setShowAuthNotification(true);
      
      // Auto hide notification after 5 seconds
      setTimeout(() => {
        setShowAuthNotification(false);
      }, 5000);
    }
  };

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CTRLC</span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.link} 
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border-b-2 border-cyan-400"
                  onClick={(e) => handleNavigation(e, item.link, item.protected)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {/* Show Logout if logged in, otherwise show Login */}
              {session ? (
                <button onClick={() => signOut()} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-white hover:bg-gray-800">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              ) : (
                <Link href="/api/auth/signin" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-green-400 hover:text-white hover:bg-gray-800">
                  <LogIn className="h-5 w-5 mr-2" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border-l-2 border-cyan-400"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-gray-800`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.link} 
                className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border-l-2 border-cyan-400"
                onClick={(e) => handleNavigation(e, item.link, item.protected)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* Show Logout if logged in, otherwise show Login */}
            {session ? (
              <button onClick={() => signOut()} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-white hover:bg-gray-700">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            ) : (
              <Link href="/api/auth/signin" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-green-400 hover:text-white hover:bg-gray-700">
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Authentication Notification - Top Right Animated */}
      {showAuthNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className="bg-gray-800 border-l-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/20 p-4 max-w-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-white">Authentication Required</h3>
                <div className="mt-2 text-sm text-gray-300">
                  <p>You need to be logged in to access this page.</p>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/api/auth/signin"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Login
                    <ArrowRight className="h-4 w-4 ml-1 animate-bounceRight" />
                  </Link>
                  <button
                    type="button"
                    className="ml-3 inline-flex items-center px-3 py-2 border border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                    onClick={() => setShowAuthNotification(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes bounceRight {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounceRight {
          animation: bounceRight 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

export default NavigationBar;