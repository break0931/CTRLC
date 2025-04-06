import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Strategie from '../../../../models/strategie';

export async function GET() {  // Use GET instead of POST
    try {
        await connectMongoDB();
        const strategies = await Strategie.find({});
        return NextResponse.json( strategies );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred while fetching strategies." },
            { status: 500 }
        );
    }
}
