import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Mt5_account from '../../../../models/mt5account';

export async function POST(req) {  // Use GET instead of POST
    const { id } = await req.json();
  
    if ( !id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
   console.log(id);
    try {
        await connectMongoDB();
        const result = await Mt5_account.findOne({ mt5_id:id});
        console.log("RESULTTTTTTTTT "  ,result);
        return NextResponse.json( result );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred while fetching strategies." },
            { status: 500 }
        );
    }
}
