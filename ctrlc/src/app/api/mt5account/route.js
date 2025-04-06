import { NextResponse } from 'next/server'
import { connectMongoDB } from '../../../../lib/mongodb';

import Token from '../../../../models/token';
import Mt5_account from '../../../../models/mt5account';
import mongoose from 'mongoose';

export async function POST(req) {

  const {user_id } = await req.json()
  console.log(user_id)
  if ( !user_id) return NextResponse.json({ error: "Missing token or user ID" }, { status: 400 });

  try {
    await connectMongoDB();
  
    
 // Step 1: Use the aggregation pipeline to join the Token collection with Mt5Account collection
    const result = await Token.aggregate([
        {
        $match: { user_id: new mongoose.Types.ObjectId(user_id) }, // Step 2: Filter the tokens by user_id
        },
        {
        $lookup: {
            from: 'mt5_accounts',  // The name of the MT5 collection (ensure it's lowercase if default)
            localField: 'token',   // The field in `Token` to match
            foreignField: 'token', // The field in `Mt5Account` to match
            as: 'mt5Account',      // The alias to store the matched result in
        },
        },
        {
        $unwind: { path: '$mt5Account', // Step 3: Unwind the results (optional)
                  preserveNullAndEmptyArrays: false},  // Only include documents where `mt5Account` exists

        },
        {
          $project: {
            _id: 0,                      // Optionally exclude the _id field
            mt5_name: '$mt5Account.mt5_name',  // Select mt5_name from the `mt5Account`
            mt5_id: '$mt5Account.mt5_id',      // Select mt5_id from the `mt5Account`
            account_type: '$mt5Account.account_type',  // Select account_type from the `mt5Account`
          },
        },
    ]);
    console.log(user_id)
    // result.map(doc => doc.mt5Account);
    return NextResponse.json( result , { status: 200 });
  
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
