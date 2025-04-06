import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import mongoose from 'mongoose';
import User from '../../../../models/user';
import Strategie from '../../../../models/strategie';
import Bill from '../../../../models/bill';
import Token from '../../../../models/token';
import Mt5_account from '../../../../models/mt5account';

export async function GET(req) {
    try {
        await connectMongoDB();

        // Total Revenue
        const totalRevenueResult = await Bill.aggregate([
            { $match: { status: "Paid" } }, 
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Total Customers
        const totalCustomers = await User.countDocuments();

        // Active Strategies
        const activeStrategies = await Strategie.countDocuments();

        // Revenue Overview Graph
        const revenueOverview = await Bill.aggregate([
            { $match: { status: "Paid" } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$bill_created" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        let cumulativeSum = 0;
        const revenueGraph = revenueOverview.map((data) => {
            cumulativeSum += data.total;
            return { month: data._id, revenue: cumulativeSum };
        });

        // Customer Growth Graph
        const customerGrowth = await User.aggregate([
            
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        let cumulativeUsers = 0;
        const customerGrowthGraph = customerGrowth.map((data) => {
            cumulativeUsers += data.count;
            return { month: data._id, customers: cumulativeUsers };
        });

        // Top Strategies with Name & Symbol
        const topStrategiesRaw = await Bill.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: "$strategy_id", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);

        const strategyIds = topStrategiesRaw.map(s => s._id);
        const strategies = await Strategie.find({ _id: { $in: strategyIds } }, "name symbol");

        const topStrategies = topStrategiesRaw.map((s) => ({
            strategy_id: s._id,
            total: s.total,
            name: strategies.find(strat => String(strat._id) === String(s._id))?.name || "Unknown",
            symbol: strategies.find(strat => String(strat._id) === String(s._id))?.symbol || "-"
        }));

        // Top Customers with Name & Email
        const topCustomersRaw = await Bill.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: "$mt5_id", total: { $sum: "$amount" } } }
        ]);

        // Get corresponding mt5 accounts
        const mt5Ids = topCustomersRaw.map(c => c._id);
        const mt5Accounts = await Mt5_account.find({ mt5_id: { $in: mt5Ids } }, "mt5_id token");

        const tokenMap = {};
        mt5Accounts.forEach(acc => { tokenMap[acc.mt5_id] = acc.token; });

        // Fetch users linked to tokens
        const tokens = Object.values(tokenMap);
        const tokenUsers = await Token.find({ token: { $in: tokens } }, "token user_id");

        const userMap = {};
        tokenUsers.forEach(t => { userMap[t.token] = t.user_id; });

        // Calculate total revenue per user
        const userRevenueMap = {};
        topCustomersRaw.forEach(({ _id, total }) => {
            const token = tokenMap[_id];
            const userId = userMap[token];
            if (userId) {
                userRevenueMap[userId] = (userRevenueMap[userId] || 0) + total;
            }
        });

        // Get user details (name, email)
        const userIds = Object.keys(userRevenueMap);
        const users = await User.find({ _id: { $in: userIds } }, "name email");

        const sortedTopCustomers = Object.entries(userRevenueMap)
            .map(([userId, total]) => ({
                user_id: userId,
                total,
                name: users.find(u => String(u._id) === userId)?.name || "Unknown",
                email: users.find(u => String(u._id) === userId)?.email || "-"
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        return NextResponse.json({
            totalRevenue,
            totalCustomers,
            activeStrategies,
            revenueGraph,
            customerGrowthGraph,
            topStrategies,
            topCustomers: sortedTopCustomers
        }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
