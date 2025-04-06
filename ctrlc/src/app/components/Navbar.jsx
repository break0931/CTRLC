"use client"

import React from 'react'
import Link from 'next/link'
import NextLogo from '../../../public/next.svg'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useSession } from "next-auth/react";
 
function Navbar() {  
    const { data: session } = useSession();

    return (
        <nav className='bg-white flex justify-between items-center shadow-md p-5'>
            <div className='flex w-1/2 '>
                <Link href="/">
                    <Image src={NextLogo} width={100} height={100} alt='nextjs logo' />
                </Link>
                <ul className='mx-10 flex  gap-4 justify-between'>
                    <li className='font-bold cursor-pointer' ><Link href='/Strategy'>Strategy</Link></li>
                    <li className='font-bold cursor-pointer'><Link href='/dashboard'>Dashboard</Link></li>
                    <li className='font-bold cursor-pointer'><Link href='/subscribed'>Subscribed</Link></li>
                    <li className='font-bold cursor-pointer'>PriceChart</li>
                    <li className='font-bold cursor-pointer'><Link href='/bill'>Bill</Link></li>
                </ul>
            </div>
            <ul className='flex space-x-4'>
                {!session ? (
                    <>
                        <li><Link href="/login">Login</Link></li>
                        <li><Link href="/register">Register</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link href="/welcome" className=''>Profile</Link></li>
                        <li><a onClick={() => signOut()} className=''>Logout</a></li>
                    </>
                )}
            </ul>
        </nav>
    )
}

export default Navbar
