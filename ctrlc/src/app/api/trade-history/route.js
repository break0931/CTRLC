//export const runtime = 'nodejs'; // Force Node.js runtime
import { NextResponse } from "next/server";
 
export async function POST(req) {
  try {
    const { mt5_id } = await req.json();
    if (!mt5_id) {
      return NextResponse.json({ error: "Missing mt5_id" }, { status: 400 });
    }
    console.log("call fastify api ")
    const response = await fetch("http://127.0.0.1:5000/nodeZeromq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mt5_id }),
    });

    const data = await response.json();
    
   
    return NextResponse.json(  data );
  
 
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}














