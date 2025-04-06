

'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Container from '../../components/Container'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ChevronLeft, Check, TrendingUp, DollarSign, Zap } from 'lucide-react'

function Copy() {
    const { data: session } = useSession();

    const { name } = useParams();  // Access the dynamic part of the URL
    // Check if the query object is defined before trying to destructure
    if (!name) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-pulse text-cyan-400">Loading...</div>
            </div>
        );
    }
    const decodedName = decodeURIComponent(name);
    const [strategies, setStrategies] = useState("");
    const [mt5accounts, setMt5accounts] = useState([]);
    const [selectedType, setSelectedType] = useState("All");
    const [selectedAccount, setSelectedAccount] = useState(null);

    const fetchMt5Account = async () => {
        try {
            const response = await fetch("../api/available_mt5", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: session?.user?.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setMt5accounts(result);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchMt5Account();
        }
    }, [session]);


    const fetchstrategyinfo = async () => {
        try {
            const response = await fetch("/api/strategyinfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name }),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setStrategies(data);
            console.log(data);
        } catch (error) {
            console.error('Error fetching strategies:', error);
        }
    }
    useEffect(() => {

        fetchstrategyinfo();
    }, []);

    const filteredAccounts =
        selectedType === "All"
            ? mt5accounts
            : mt5accounts.filter((account) => account.account_type === selectedType);

    const handleSubmit = async () => {
        try {
            const response = await fetch("../api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({

                    mt5_id: selectedAccount.mt5_id,
                    strategie_id: strategies._id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">

            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center gap-4">
                            <Link href={`/Strategy/${strategies.name}`} className="flex-shrink-0">
                                <div className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                                    <ChevronLeft className="h-5 w-5 text-cyan-400" />
                                </div>
                            </Link>

                            <div className="flex-1 text-xl md:text-2xl font-bold truncate">
                                {decodedName}
                            </div>

                            <div className="flex items-center ml-auto space-x-2">
                                <div className="bg-gray-700 p-2 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                                </div>
                                <span className="text-cyan-400 font-medium whitespace-nowrap">{strategies.symbol}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="px-6 py-4 border-b border-gray-700 flex flex-col sm:flex-row sm:justify-start sm:items-center gap-3">
                        <h3 className="text-lg font-bold text-white">Select MT5 account</h3>
                        
                    </div>

                    {/* Accounts List */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-gray-900">
                        <div className="flex flex-col items-center space-y-4">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedAccount(account)}
                                        className={`w-full sm:w-4/5 p-4 rounded-lg cursor-pointer transition-all duration-300 border ${selectedAccount?.mt5_id === account.mt5_id
                                                ? 'scale-105 shadow-lg border-cyan-500 bg-gray-800'
                                                : 'border-gray-700 bg-gray-800 hover:border-cyan-500 hover:translate-y-[-4px]'
                                            }`}
                                    >
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <div className={`px-2 py-1 rounded text-xs text-white font-medium ${account.account_type === 'real'
                                                    ? 'bg-gradient-to-r from-green-600 to-green-700'
                                                    : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                                                }`}>
                                                {account.account_type}
                                            </div>
                                            <div className="bg-gray-700 px-2 py-1 rounded text-xs text-cyan-400 font-medium">MT5</div>
                                        </div>
                                        <div className="text-white mt-2 font-medium">{account.mt5_name}</div>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="text-gray-400 font-bold mt-1">ID: {account.mt5_id}</div>

                                            {selectedAccount?.mt5_id === account.mt5_id && (
                                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full p-1.5">
                                                    <Check className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No available MT5 accounts found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Button */}
                    <div className="p-6 border-t border-gray-700 bg-gray-800">
                        <Link className="block w-full" href="/subscribed">
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedAccount}
                                className={`w-full rounded-lg p-3 font-medium transition-all duration-300 flex items-center justify-center ${selectedAccount
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/30 hover:shadow-lg text-white'
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {selectedAccount ? (
                                    <>Start Copy Trading <Zap className="ml-2 h-5 w-5" /></>
                                ) : (
                                    'Select an account to continue'
                                )}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Copy