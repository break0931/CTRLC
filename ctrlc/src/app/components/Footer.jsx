'use client'
import React from 'react'
import { ChevronUp, Mail, MessageSquare, Shield, Github, Twitter, Linkedin, Facebook, Instagram, Youtube, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-white">
      {/* Back to top button */}
      <div className="flex justify-center">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>
      
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CTRLC</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Follow top-performing traders and automatically replicate their strategies in real-time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">Home</a></li>
              <li><a href="/Strategy" className="text-gray-400 hover:text-cyan-400 transition-colors">Strategy</a></li>
              <li><a href="/pricechart" className="text-gray-400 hover:text-cyan-400 transition-colors">Price Chart</a></li>
             
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-medium mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-medium mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-cyan-400" />
                <a href="mailto:support@tradesync.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  support@CTRLC.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-cyan-400" />
                <a href="tel:+18001234567" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  +1 (800) 123-4567
                </a>
              </li>
             
            </ul>
            
          </div>
        </div>
      
        
        {/* Bottom footer section */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} CTRLC. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Privacy Policy</a>
            
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <div className="flex items-center justify-center">
              <Shield className="h-4 w-4 mr-1" />
              <span>Trading involves risk. Only invest what you can afford to lose.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer