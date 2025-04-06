import React from 'react'

function Payment() {

  
    async function handleOnboard() {
      
      const response = await fetch('/api/stripe/create_stripe_master', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session?.user?.email }) // Replace with actual email
      });
  
      const data = await response.json();
      if (data.url) {
          window.location.href = data.url; // Redirect to Stripe
      } else {
          alert("❌ Error: " + data.error);
      }
      
    
    
    }
  return (
    <div>Payment</div>
  )
}

export default Payment