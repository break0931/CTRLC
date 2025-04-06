'use client'
import React from 'react'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useParams } from "next/navigation"

const CancelPage = ({ params }) => {
  
  const { bill_id } = useParams()
 

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      

      {/* Cancel content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-gray-400 mb-6">
              Your payment process was cancelled. No charges have been made to your account.
            </p>
            
            <div className="w-full bg-gray-900 rounded-lg p-4 mb-6">
              <span className="text-gray-400 text-sm">Bill ID</span>
              <p className="font-mono text-sm mt-1 truncate">{bill_id}</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-center w-full mb-6">
              <span className="text-gray-400 text-sm block mb-1">Possible reasons for cancellation:</span>
              <ul className="text-sm text-left mt-2 space-y-1">
                <li>• Payment information was incorrect</li>
                <li>• Card was declined by your bank</li>
                <li>• You manually cancelled the transaction</li>
                <li>• Connection issue during payment</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
             
              
              <Link
                href="/bill"
                className="px-6 py-3 flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Link>
            </div>
            
           
            
          </div>
        </div>
      </div>
      
      
    </div>
  )
}

export default CancelPage