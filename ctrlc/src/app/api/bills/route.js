import { connectMongoDB } from "../../../../lib/mongodb";
import Bill from "../../../../models/bill";
import Token from "../../../../models/token";
import Mt5_account from "../../../../models/mt5account";
import User from "../../../../models/user";
import mongoose from "mongoose";
import Strategie from "../../../../models/strategie";
import { NextResponse } from "next/server";


export async function POST(req){


    const {user_id} = await req.json()
    if(!user_id ){
        return NextResponse.json({ error: "Missing token or user ID" },{status : 400})
    }

    console.log("user_id " , user_id)
    try{
        await connectMongoDB()
        const alltoken = await Token.find({ user_id }).select("token");
        console.log("alltoken match user_id" , alltoken)
        const tokens = alltoken.map(token => token.token);
        console.log("only token ?" , tokens)
        // Step 2: Find all MT5 accounts using the retrieved tokens
        const mt5Accounts = await Mt5_account.find({ token: { $in: tokens } }).select("mt5_id");
        console.log("all mt5 match token" , mt5Accounts)
        const mt5AccountIds = mt5Accounts.map(account => account.mt5_id);
        console.log("only mt5 ?" , mt5AccountIds)

        // Step 3: Find all bills associated with these MT5 accounts
        const bills = await Bill.find({ mt5_id: { $in: mt5AccountIds } }); 
        //console.log("bills asdasd sad assadasdd   ")
        console.log("bills   " , bills)

   
        // Step 4: Get all unique strategy_ids from the bills
        const strategyIds = [...new Set(bills.map(bill => bill.strategy_id))];
        
        // Step 5: Fetch strategy names from your strategy model
        const strategies = await Strategie.find({ _id: { $in: strategyIds } });
        console.log("strategies  " , strategies )
        // Create a mapping of strategy_id to strategy_name
        const strategyMap = {};
        strategies.forEach(strategy => {
            strategyMap[strategy._id] = strategy.name;
        });
        
        // Add strategy_name to each bill
        const billsWithStrategyNames = bills.map(bill => {
            return {
                ...bill.toObject(),
                strategy_name: strategyMap[bill.strategy_id] || "Unknown Strategy"
            };
        });
        console.log("bills   " , billsWithStrategyNames )
        return NextResponse.json(billsWithStrategyNames);
    }catch(err){
        return NextResponse.json({status:500},{error: err.message})
    }



}