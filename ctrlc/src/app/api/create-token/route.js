import { NextResponse } from 'next/server'
import { connectMongoDB } from '../../../../lib/mongodb';
import Token from '../../../../models/token';

import Mt5_account from '../../../../models/mt5account';

import mongoose from 'mongoose';
async function checkTokenInMT5Accounts(inputtoken, user_id) {
  await connectMongoDB();
  const MAX_RETRIES = 100; // Maximum attempts
  const INTERVAL = 3000; // Check every 3 seconds

  for (let i = 0; i < MAX_RETRIES; i++) {
    // Check if token exists in mt5_accounts
    const existingAccount = await Mt5_account.findOne({
      token:inputtoken
    });
   
    if (existingAccount) return true; // Token matched in MT5 accounts

    await new Promise((resolve) => setTimeout(resolve, INTERVAL)); // Wait before retrying
  }
  return false; // Timeout reached
}

export async function POST(req) {

  const { token, user_id } = await req.json()
  console.log(typeof(user_id))
  if (!token || !user_id) return NextResponse.json({ error: "Missing token or user ID" }, { status: 400 });
  
  
  try {
    await connectMongoDB();

    const newToken = new Token({
      token,
      user_id: new mongoose.Types.ObjectId(user_id), // Explicitly convert to ObjectId
    });
    
    await newToken.save();
  
    // Step 2: Wait until token is found in mt5_accounts
    const isVerified = await checkTokenInMT5Accounts(token, user_id);

    if (isVerified) {
      return NextResponse.json({ message: true }, { status: 200 });;
    } else {
      await Token.deleteOne({ token})
      return NextResponse.json({ message: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
