'use client'

import React, { useState ,useEffect} from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mail, Lock, ArrowRight, User } from 'lucide-react'

function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")


    const { data: session } = useSession()
    const router = useRouter() // Move useRouter() here

    useEffect(() => {
        if (session) {
            router.replace('/')
        }
    }, [session, router]) 
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }
        try {
            const res = await signIn("credentials", {
                email, password, redirect: false
            })
            console.log(res)
            if (res.error) {
                setError("Invalid credentials")
                return
            }

            router.replace("/")
        } catch (error) {
            console.log(error)
        }
    }

 

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Left side - Login Form */}
            <div className="w-full lg:w-3/5 flex flex-col">

                <div className="flex-grow flex justify-center items-center p-4">
                    <div className="w-full max-w-md">
                        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
                            <h3 className="text-3xl font-bold mb-2">Welcome Back</h3>
                            <p className="text-gray-400 mb-6">Sign in to access your trading account</p>

                            {error && (
                                <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded mb-4 flex items-center">
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 py-3 pl-10 pr-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-gray-400 text-sm">Password</label>
                                        <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">Forgot password?</a>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 py-3 pl-10 pr-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center"
                                >
                                    Sign In <ArrowRight className="ml-2 h-5 w-5" />
                                </button>

                                <div className="flex items-center my-6">
                                    <div className="flex-grow h-px bg-gray-700"></div>
                                    <span className="px-4 text-sm text-gray-400">or continue with</span>
                                    <div className="flex-grow h-px bg-gray-700"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => signIn('google', { callbackUrl: '/welcome' })}
                                    className="w-full bg-gray-800 border border-gray-700 hover:border-cyan-500 text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </form>

                            <div className="text-center mt-8">
                                <p className="text-gray-400">
                                    Don't have an account?
                                    <Link href="/register" className="ml-1 text-cyan-400 hover:text-cyan-300 transition-colors">
                                        Create one now
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Right side - Enhanced Background */}
            <div className="hidden lg:block w-2/5 relative overflow-hidden">
                {/* Base gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-blue-900"></div>

                {/* Trading charts/data visualization abstract elements */}
                <div className="absolute inset-0">
                    {/* Animated gradient lines */}
                    <svg width="100%" height="100%" className="">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#2196F3" stopOpacity="0.6" />
                            </linearGradient>
                            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#E91E63" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#9C27B0" stopOpacity="0.6" />
                            </linearGradient>
                        </defs>

                        {/* Uptrend line */}
                        <path d="M0,400 Q100,350 200,300 T400,250 T600,200 T800,100" stroke="url(#grad1)" strokeWidth="2" fill="none" />

                        {/* Downtrend line */}
                        <path d="M0,200 Q100,250 200,280 T400,320 T600,250 T800,300" stroke="url(#grad2)" strokeWidth="2" fill="none" />

                        {/* Candlestick abstractions */}
                        <g className="opacity-40">
                            {[100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700].map((x, i) => (
                                <g key={i} transform={`translate(${x}, ${150 + Math.sin(x * 0.05) * 50})`}>
                                    <line x1="0" y1="-15" x2="0" y2="15" stroke="#4CAF50" strokeWidth="2" />
                                    <rect x="-3" y="-10" width="6" height={20} fill={i % 2 === 0 ? "#4CAF50" : "#E91E63"} />
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                }}></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <div className="relative w-64 h-64 mb-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-lg opacity-70 animate-pulse"></div>
                        <div className="relative bg-gray-800 bg-opacity-50 rounded-full p-4 w-full h-full flex items-center justify-center border border-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <defs>
                                    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#06b6d4" /> 
                                        <stop offset="100%" stopColor="#2563eb" /> 
                                    </linearGradient>

                                    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#2196F3" stopOpacity="0.8" /> 
                                    </linearGradient>

                                    <linearGradient id="downGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#E91E63" stopOpacity="0.8" /> 
                                        <stop offset="100%" stopColor="#9C27B0" stopOpacity="0.8" /> 
                                    </linearGradient>

                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                <g transform="translate(256, 256)">
                                    <circle cx="0" cy="0" r="140" fill="#1e293b" stroke="url(#primaryGradient)" strokeWidth="8" />

                                    <path d="M-70,-40 H-20 V-15 H-45 V15 H-20 V40 H-70 V15 H-45 V-15 H-70 Z"
                                        fill="url(#primaryGradient)" filter="url(#glow)" />

                                    <path d="M20,-40 H70 V-15 H45 A30,30 0 0,0 45,15 H70 V40 H20 A60,60 0 0,1 20,-40 Z"
                                        fill="url(#primaryGradient)" filter="url(#glow)" />
                                </g>


                                <g filter="url(#glow)">
                                    <circle cx="256" cy="256" r="230" fill="none" stroke="url(#primaryGradient)" strokeWidth="3" strokeDasharray="15,10" />

                                    <g transform="translate(256, 65) rotate(0)">
                                        <path d="M0,0 L15,-20 L-15,-20 Z" fill="#06b6d4" />
                                    </g>

                                    <g transform="translate(256, 447) rotate(180)">
                                        <path d="M0,0 L15,-20 L-15,-20 Z" fill="#2563eb" />
                                    </g>

                                    <g transform="translate(65, 256) rotate(270)">
                                        <path d="M0,0 L15,-20 L-15,-20 Z" fill="#06b6d4" />
                                    </g>

                                    <g transform="translate(447, 256) rotate(90)">
                                        <path d="M0,0 L15,-20 L-15,-20 Z" fill="#2563eb" />
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CTRLC</span>
                        </h1>
                        <p className="text-xl text-gray-300">
                            Copy Elite Strategies. Amplify Your Returns.
                        </p>

                    </div>

                    <div className="max-w-sm">
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
                            <p className="text-gray-300 italic">
                                "Follow top-performing Strategies and automatically replicate their strategies in real-time. Take the guesswork out of trading."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-32"></div>
            </div>

        </div>
    )
}

export default LoginPage