import Stripe from "stripe";
import { connectMongoDB } from "../../../../lib/mongodb";
import Bill from "../../../../models/bill";
import { NextResponse } from "next/server"; // Import NextResponse
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { bill_id } = await req.json();
    await connectMongoDB();
    const bill = await Bill.findOne({ _id: bill_id });
    console.log(bill_id);
    console.log(bill);

    const billidString = bill_id.toString();
    console.log(typeof (billidString));

    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const usdToThbRate = data.rates.THB;

   
    let finalAmount
    const fine = 1.1
    if (bill.status === "Expired") {
      
      finalAmount = Math.round(bill.amount * fine * usdToThbRate * 100);
    } else {
      
      finalAmount = Math.round(bill.amount * usdToThbRate * 100); // Convert to Satangs
    }

    // // Create a temporary price based on the bill amount
    const price = await stripe.prices.create({
      unit_amount: finalAmount,
      currency: "thb",
      product_data: {
        name: billidString,
        metadata: {
          bill_id: bill_id,
          mt5_id: bill.mt5_id,
          Created: bill.bill_created,
          Due: bill.due_date,
          Status: bill.status,
          master_stripe_account: bill.master_stripe_account
        },
      },
    });




    const feeAmount = Math.round(bill.amount * usdToThbRate  * 100 *  0.05); // 5% of the total



    // Determine transfer destination logic
    let paymentIntentData = {};

    if (bill.isCTRLC === false) {
      paymentIntentData = {
        application_fee_amount: feeAmount, // 5% fee
        transfer_data: { destination: bill.master_stripe_account },
      };
      console.log("Using Master Stripe Account:", bill.master_stripe_account);
    } else {
      console.log("Using My Stripe Account (No Transfer)");
    }

    //Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "promptpay"],
      mode: "payment",
      line_items: [
        {
          price: price.id,
          quantity: 1,

        },
       
      ],

      ...(Object.keys(paymentIntentData).length > 0 && {
        payment_intent_data: paymentIntentData,
      }), // Only include if necessary

      success_url: `${req.headers.get("origin")}/success/${bill_id}`,
      cancel_url: `${req.headers.get("origin")}/cancel/${bill_id}`,
      metadata: {
        bill_id: bill_id,
        master_stripe_account: bill.master_stripe_account
      },
    });

    // Return the sessionId to the frontend
    return NextResponse.json({  sessionId: session.id  });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
