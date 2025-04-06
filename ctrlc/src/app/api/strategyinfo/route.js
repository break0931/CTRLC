import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Strategie from '../../../../models/strategie';

export async function POST(req) {  // Use GET instead of POST
    const { name } = await req.json();
    const decodedName = decodeURIComponent(name);
    console.log("server" , decodedName);
    if ( !decodedName) return NextResponse.json({ error: "Missing token or user ID" }, { status: 400 });
   
    try {
        await connectMongoDB();
        const strategies = await Strategie.findOne({ name:decodedName});
        return NextResponse.json( strategies );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred while fetching strategies." },
            { status: 500 }
        );
    }
}
