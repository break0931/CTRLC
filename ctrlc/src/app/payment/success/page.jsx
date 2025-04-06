
'use client'
import React from 'react'
import { useParams } from 'next/navigation'
function Paymentsuccess() {
  
  const { account } = useParams()
  
  return (
    <div>Paymentsuccess {account}</div>
  )
}

export default Paymentsuccess