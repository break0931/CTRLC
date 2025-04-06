import { NextResponse } from 'next/server'
import { connectMongoDB } from '../../../../lib/mongodb';

import Token from '../../../../models/token';
import mongoose from 'mongoose';

export async function POST(req) {

    const { user_id } = await req.json()
    console.log(user_id)
    if (!user_id) return NextResponse.json({ error: "Missing token or user ID" }, { status: 400 });

    try {
        await connectMongoDB();
        // Step 1: Use the aggregation pipeline to join the Token collection with Mt5Account collection
        const result = await Token.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_id) }
            },
            { //Lookup mt5_accounts collection
                $lookup: {
                    from: 'mt5_accounts',
                    localField: 'token',
                    foreignField: 'token',
                    as: 'mt5Account'
                }
            },
            {
                $match: {  // alias for the array of subscription records retrieved from the subscribes collection using the $lookup stage.
                    'mt5Account': {
                        $elemMatch: { status: 'active' , account_type : 'subscriber'} // match any row has status = "active" 
                    }
                }
            },
            {
                $unwind: {
                    path: '$mt5Account',
                    preserveNullAndEmptyArrays: false
                }
            },
            { // Lookup subscribes collection
                $lookup: {
                    from: 'subscribes',
                    localField: 'mt5Account.mt5_id',
                    foreignField: 'mt5_id',
                    as: 'subscriptions'
                }
            },
            {
                $match: {  // alias for the array of subscription records retrieved from the subscribes collection using the $lookup stage.
                    'subscriptions': {
                        $not: {
                            $elemMatch: { status: 'active' } // Exclude if any row has status = "active"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    mt5_name: '$mt5Account.mt5_name',
                    mt5_id: '$mt5Account.mt5_id',
                    account_type: '$mt5Account.account_type'
                }
            }
        ]);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
