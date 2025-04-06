'use client'
import React , {useState} from 'react'
import Navbar from '../components/Navbar'
import Container from '../components/Container'
import Footer from '../components/Footer'
import Link from 'next/link'
function Copy() {

    const accountData = [  
        {id:234264313, accountName:'The OA' , amount:100000 , accountType:'Demo'},
        {id:123321355 , accountName:'The OA33' , amount:120000 , accountType:'Real'},
        {id:432431236 , accountName:'The OA55' , amount:130000 , accountType:'Real'},
        {id:527653137, accountName:'TheDDDD' , amount:40000 , accountType:'Demo'},
    ];
    const [selectedType, setSelectedType] = useState("All"); // ค่าเริ่มต้นเป็น Real

    const filteredAccounts =
    selectedType === "All"
      ? accountData
      : accountData.filter((account) => account.accountType === selectedType);

    const [selectedAccount,setSelectedAccount] = useState(null)

    console.log("Selected Account:", selectedAccount);
  return (
    <Container>
        
        <div className='min-h-screen flex justify-center '>
            <div className='w-lg border rounded-xl p-10 m-4  text-md mb-4 h-max bg-white'>
                <div className='flex justify-between font-bold '>
                    <div className='flex items-center space-x-4 w-1/2'>
                        <a href='/Strategy/idtoshowinfo'>
                            <svg width="14" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 1L1 7L7 13" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                       
                        <h3 className='text-2xl'>NEAT volume trend XAUUSD</h3>
                    </div>
                   
                    <div className='flex w-1/2 justify-end items-center'>
                        <img className='object-contain mx-2 w-10'  src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbWc7JBahO7-JwjRdbpKFoccdmAmZCBz-y6A&s'></img>
                        <span>XAUUSD</span>
                    </div>
                </div>
                <div className='flex justify-between items-center my-8'>
                    <h3 className='text-lg font-bold '>Select MT5 account</h3>
                    <div >
                        <select
                            className="p-2 border rounded-md "
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Real">Real</option>
                            <option value="Demo">Demo</option>
                        </select>
                    </div>
                </div>
                <div className='space-y-4 max-h-[60vh] overflow-y-auto text-white flex flex-col items-center'>
                    {filteredAccounts.map((account, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedAccount(account)}
                        className={`bg-[#1A2432] border w-3/4 h-40 p-8 rounded-lg cursor-pointer transition-transform duration-300  ${
                            selectedAccount?.id === account.id
                            ? 'scale-105'
                            : ''
                        }`}
                    >
                        <div className='flex space-x-2 mb-2'>
                            <div className={`bg-[#024035] w-max px-2 rounded  text-xs text-center ${
                                account.accountType === 'Real'
                                ? 'bg-[#024035]'
                                : 'bg-[#BAAA00]'
                            }`}>
                                {account.accountType}
                            </div>
                            <div className='bg-[#2E3849] w-max px-2 rounded text-xs text-center'>MT5</div>
                        </div> 
                        <div> {account.accountName}</div>
                        <div className='text-gray-300 font-bold'> {account.id}</div>
                        <div className='flex justify-between'> 
                        <div className='text-2xl font-bold'>${account.amount}</div>
                            {selectedAccount?.id === account.id && (
                            <div className='bg-brandColor flex items-center justify-center rounded w-10'> 
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1A2432"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                            </div>
                            )}
                        </div>
                      
                    </div>
                    ))}
                </div>
                <div className='flex w-full justify-center'>
                    <Link className='w-[80%] text-center' href="/dashboard">
                        <button className='w-full rounded-lg  p-3 my-4 bg-brandColor text-white'>
                            Done
                        </button>
                    </Link>
                </div>
                
            </div>
           
        </div>
        
    </Container>
    
  )
}

export default Copy