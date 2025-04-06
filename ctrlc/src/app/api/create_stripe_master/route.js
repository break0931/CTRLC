import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import User from '../../../../models/user';
import mongoose from 'mongoose';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { email , user_id } = await req.json();

        // Step 1: Create Standard Account instead of Express
        const account = await stripe.accounts.create({
            type: 'standard', // Changed from 'express' to 'standard'
            country: 'TH', // Keeping Thailand as the country
            email: email,
            business_type: 'individual',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        console.log("✅ Standard Account Created:", account.id);

        // Step 2: Create Account Onboarding Link
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/addaccount`,  // If user needs to re-auth
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/addaccount`,  // Redirect after onboarding
            type: 'account_onboarding',
        });

        await connectMongoDB()

        await User.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(user_id) },
            {
                stripe_account : account.id
            },
            { new: true }
        );

        return NextResponse.json({ 
            url: accountLink.url, 
            account_id: account.id 
        });

    } catch (error) {
        console.error("❌ Error Creating Account:", error.message);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}