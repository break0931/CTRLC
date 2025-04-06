import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Token from '../../../../models/token';
import mongoose from 'mongoose';

export async function POST(req) {
    const { user_id } = await req.json();
    if (!user_id) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    try {
        await connectMongoDB();

        const result = await Token.aggregate([
            { 
                $match: { user_id: new mongoose.Types.ObjectId(user_id) }
            },
            { 
                $lookup: {
                    from: 'mt5_accounts',
                    localField: 'token',
                    foreignField: 'token',
                    as: 'mt5Account'
                }
            },
            { 
                $unwind: { 
                    path: '$mt5Account', 
                    preserveNullAndEmptyArrays: false 
                } 
            },
            { 
                $lookup: {
                    from: 'subscribes',
                    localField: 'mt5Account.mt5_id',
                    foreignField: 'mt5_id',
                    as: 'subscriptions'
                }
            },
            { 
                $unwind: { 
                    path: '$subscriptions', 
                    preserveNullAndEmptyArrays: false 
                } 
            },
            { 
                $lookup: {
                    from: 'strategies',
                    localField: 'subscriptions.strategie_id',
                    foreignField: '_id',
                    as: 'strategy'
                }
            },
            { 
                $unwind: { 
                    path: '$strategy', 
                    preserveNullAndEmptyArrays: true 
                } 
            },
            {
                $project: {
                    _id: 0,
                    mt5_name: '$mt5Account.mt5_name',
                    mt5_id: '$mt5Account.mt5_id',
                    account_type: '$mt5Account.account_type',
                    strategy_name: '$strategy.name',
                    symbol: '$strategy.symbol',
                    status: '$subscriptions.status',
                    sub_id : '$subscriptions._id',
                    start_date: '$subscriptions.start_date',
                    end_date: '$subscriptions.end_date',
                }
            }
        ]);

        //console.log("Fetched Subscriptions:", result); // Debugging log
        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
