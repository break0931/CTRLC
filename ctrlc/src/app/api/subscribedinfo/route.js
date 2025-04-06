import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Subscribe from '../../../../models/subscribe';
export async function POST(req) {  // Use GET instead of POST
    const { id } = await req.json();
   
    console.log("server" ,id);
    if ( !id) return NextResponse.json({ error: "Missing token or user ID" }, { status: 400 });
   
    try {
        await connectMongoDB();
        const result = await Subscribe.findOne({ _id : id});
        return NextResponse.json( result );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred while fetching strategies." },
            { status: 500 }
        );
    }
}
