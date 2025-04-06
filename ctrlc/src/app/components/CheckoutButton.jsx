import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutButton({ bill_id }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const res = await fetch("/api/checkout_session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bill_id : bill_id }),
    });

    const { sessionId  } = await res.json();

    // Redirect to Stripe checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
   
    if (error) {
      console.error("Error during checkout:", error.message);
    }
  };

  return (
    <button onClick={handleCheckout} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
      Checkout
    </button>
  );
}




