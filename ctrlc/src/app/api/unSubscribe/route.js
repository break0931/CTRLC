import { message } from "antd";
import { connectMongoDB } from "../../../../lib/mongodb";
import Subscribe from "../../../../models/subscribe";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
export async function POST(req){
    const {sub_id} = await req.json(); 
    if(!sub_id){
        return NextResponse.json({error :"missing sub_id"}  ,{status:400});
    }
    console.log(sub_id);
    try{
        await connectMongoDB();

        // const result = await Subscribe.findOne({ _id : sub_id});
        // console.log( "unscribe                 dsad sadsa"  , result);
        const result = await Subscribe.findByIdAndUpdate( sub_id ,{status : 'inactive' ,  end_date: new Date(),} , {new : true});
        
        console.log(result);

        return NextResponse.json({message:"unsubscribe"},{status:200});

        

    }catch(error){
        console.log(error);
        return NextResponse.json({ error : "server error" } ,{status:500});

    }
}