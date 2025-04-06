import { buffer } from 'micro';
import Stripe from 'stripe';
import { NextResponse } from 'next/server'; // Import NextResponse
import { headers } from 'next/headers';
import { connectMongoDB } from '../../../../lib/mongodb';
import mongoose from 'mongoose';
import Bill from '../../../../models/bill';
import User from '../../../../models/user';
import Mt5_account from '../../../../models/mt5account';
import { UpdateModeEnum } from 'chart.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function POST(req) {

    let event;

    try {
        const stripeSignature = (await headers()).get('stripe-signature');

        event = stripe.webhooks.constructEvent(
            await req.text(),
            stripeSignature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Error verifying webhook signature:', err.message);
        return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }
    // Successfully constructed event.
    console.log('✅ Success:', event.id);


    // Step 4: Handle the webhook event



    switch (event.type) {
        case 'checkout.session.completed':
                await connectMongoDB()
                const session = event.data.object;

                const bill_id = new mongoose.Types.ObjectId(session.metadata?.bill_id);

                console.log('✅ Payment successful:', event.data.object.payment_status);


                await Bill.findOneAndUpdate(
                    { _id: bill_id },
                    { status: "Paid" },
                    { new: true }

                )
                
                const billInfo = await Bill.findOne({ _id: bill_id })
                // Check if bill was previously Expired
                console.log(typeof(billInfo.status) , "    " , billInfo.status )
            
                

                //check unbanned everytime pay bills
                const activeBills = await Bill.find({ 
                    mt5_id: billInfo.mt5_id, 
                    status: { $eq: 'Expired' } 
                });
                // Find MT5 account with the same MT5 ID and update status to active
                if (activeBills.length === 0) {
                    await Mt5_account.findOneAndUpdate(
                        { mt5_id: billInfo.mt5_id },
                        {
                            status: 'active',
                        },
                        { new: true }
                    );
            
                    console.log(`✅ MT5 Account ${billInfo.mt5_id} reactivated`);
                } else {
                    console.log(`❌ MT5 Account ${billInfo.mt5_id} not reactivated. Expired bills exist.`);
                }

                console.log(`✅ MT5 Account ${billInfo.mt5_id} reactivated`);
            


                const master_stripe_account = session.metadata?.master_stripe_account;
 
    



           
            return NextResponse.json({ success: true });
        case 'payment_intent.succeeded':
            console.log('💰 PaymentIntent was successful!', event.data.object.status);
            break;
        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed!', event.data.object.last_payment_error?.message);
            break;
        case 'account.updated' :
            const account = event.data.object;
            
            // Check if the account is fully enabled
            if (account.charges_enabled && account.payouts_enabled) {
                await connectMongoDB();
                await User.findOneAndUpdate(
                    { stripe_account: account.id },
                    {
                        isOnboard: true, // Confirm user is fully onboarded
                       
                    },
                    { new: true }
                );

                console.log("✅ User Stripe account verified:", account.id);
            }
        
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
