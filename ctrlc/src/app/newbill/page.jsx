"use client"
import { React, useState, useEffect } from "react"
import { useSession } from "next-auth/react"


function newbill() {
    const { data: session } = useSession([])
    const [bills, setBills] = useState([])

    useEffect(() => {
        const fetchBills = async () => {
            const response = await fetch("/api/bills", {
                method: "POST",
                headers: { "Content-type": 'application/json' },
                body: JSON.stringify({ user_id: session?.user?.id }),


            })
            const result = await response.json()
            setBills(result)
        }
        if (session?.user?.id) {
            fetchBills()

        }



    }, [session])

    console.log("bills ", bills)    


    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills.filter(bill => bill.status === 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
    const unpaidAmount = bills.filter(bill => bill.status === 'Unpaid').reduce((sum, bill) => sum + bill.amount, 0);
    return (
        <div>
            <div>Billiing Overview</div>
            <div className='grid grid-cols-3 mb-4' >

                <div className='border border-1 w-full h-16'>total bills
                    <div>{totalAmount}</div>
                </div>
                <div className='border border-1 w-full h-16'>Paid                     
                    <div>{paidAmount}</div>
                </div>
                <div className='border border-1 w-full h-16'>Unpaid                     
                    <div>{unpaidAmount}</div>
                </div>

            </div>
            <div className=" grid grid-cols-5">
                <div className='bg-gray-300 w-full h-16'>bill_id</div>
                <div className=' w-full h-16'>mt5_id</div>
                <div className='bg-gray-300 w-full h-16'>create date</div>
                <div className='w-full h-16'>due date</div>
                <div className='bg-gray-300 w-full h-16'>status</div>
            </div>
            {bills.map((bill, idx) => (
                <div key={idx} className=" grid grid-cols-5">
                    <div>{bill._id}</div>
                    <div>{bill.mt5_id}</div>

                    <div className="text-sm text-gray-400">{bill.bill_created.split('T')[0]}</div>
                    <div className="text-sm text-gray-400">{bill.due_date.split('T')[0]}</div>
                    <div className="text-sm text-gray-400">{bill.status}</div>

                </div>
            ))}

        </div>
    )
}

export default newbill