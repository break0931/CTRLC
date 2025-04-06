'use client'
import React, {  useState } from 'react'
import { CheckCircle,  Copy, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useParams } from "next/navigation"

const SuccessPage = ({ params }) => {
  const { bill_id } = useParams()
  const [copied, setCopied] = useState(false)


  const copyToClipboard = () => {
    navigator.clipboard.writeText(bill_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      

      {/* Success content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            
            <div className="w-full bg-gray-900 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Bil ID</span>
                <button 
                  onClick={copyToClipboard}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="font-mono text-sm mt-1 truncate">{bill_id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <span className="text-gray-400 text-sm block mb-1">Status</span>
                <span className="text-green-400 font-medium">Completed</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <span className="text-gray-400 text-sm block mb-1">Date</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link
                href="/bill"
                className="px-6 py-3 flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center"
              >
                Return to Bill Page
              </Link>
            </div>
            
          
          </div>
        </div>
      </div>
      
    
    </div>
  )
}

export default SuccessPage