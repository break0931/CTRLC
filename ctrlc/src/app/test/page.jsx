'use client'
import React from 'react'
import StatsPage from '../components/Stats'
function Test() {
  return (
    <div>Test
           <StatsPage pageType='strategy'/>
           <StatsPage pageType='subscribed'/>
           <StatsPage pageType='mt5account'/>
    </div>
    
 
  )
}

export default Test