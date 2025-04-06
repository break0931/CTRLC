// 'use client'
// import React, { useState,useEffect, useRef } from 'react'
// import ReactDOM from 'react-dom';
// import Countdown from 'react-countdown';

// import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
// import Container from '../components/Container'
// import Link from 'next/link'
// import { ClipboardCopy , RefreshCcw} from "lucide-react";
// import cryptoRandomString from "crypto-random-string";
// import { useSession } from "next-auth/react";
// import { Suspense } from 'react'
// import { layouts } from 'chart.js'

// function Addaccount() {

//   const { data: session } = useSession();
//   console.log(session)


//   const [isReal, setIsReal] = useState(true); // Default to Real
//   const handleToggle = () => {
//     setIsReal(!isReal);
//   };
//   const [setupGuide, setSetupGuide] = useState(false);

//   const handleSubmit = () => {
//     // Check if the amount is within the range
//     // if (amount < 100 || amount > 100000) {
//     //   alert('Amount must be between 100 and 100000');
//     //   return;
//     // }

//     // if (leverage < 1 || leverage > 1000) {
//     //   alert('leverage must be between 1 and 1000');
//     //   return;
//     // }

//     // Proceed with the submission logic
//     alert('Account created successfully!');
//     // Add any other submission logic here
//   };



//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(token);
//   };



//   const [token, setToken] = useState("");

//   const generateToken = () => {

//     const newToken = cryptoRandomString({ length: 32, type: "alphanumeric" });
//     setToken(newToken);
//   };  


//   const [loading,setLoading] = useState(false);
//   const [success,setSuccess] = useState(true);
//   const [complete,setComplete] = useState(false);
//   const [uncomplete,setUncomplete] = useState(false);
//   const CreateAccount = async () => {
//     setComplete(false);
//     setUncomplete(false);

//     setLoading(true);
//     setSuccess(false);
//     try {
//       const response = await fetch("/api/create-token", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token: token, user_id: session?.user?.id }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSuccess(true);
//         console.log(data)
//       } else {
//         alert(data.error || "Failed to verify token.");
//       }

//       console.log(data)
//       console.log(data?.message)
//       if (data?.message){
//         setComplete(true)
//       }else{
//         setUncomplete(true)
//       }

//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }

//   };








//   const CountdownTimer = ({ minutes = 5 }) => {
//     const [timeLeft, setTimeLeft] = useState(minutes * 60);

//     useEffect(() => {
//       if (timeLeft <= 0) return;

//       const timer = setInterval(() => {
//         setTimeLeft((prev) => prev - 1);
//       }, 1000);

//       return () => clearInterval(timer);
//     }, [timeLeft]);

//     const formatTime = (time) => {
//       const mins = Math.floor(time / 60);
//       const secs = time % 60;
//       return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//     };

//     return <h1>Time Left: {formatTime(timeLeft)}</h1>;
//   };

//   return (
//     <Container>

//       <div className='min-h-screen  flex justify-center'>
//         {setupGuide && (
//           <div className="fixed inset-1 flex items-center justify-center bg-black bg-opacity-50 z-10">
//             <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//               {/* Modal Header */}
//               <div className="flex justify-between items-center">
//                 <h2 className="text-lg font-bold">Setup Guide for EA Metatrader5</h2>
//                 <button onClick={() => setSetupGuide(false)} className="text-gray-600 hover:text-gray-900">
//                   ✖
//                 </button>
//               </div>

//               {/* Modal Content */}
//               <p className="mt-3">1. Download the <b>ctrlcAPI.ex5</b> file from our website.</p>
//               <p>2. Open MetaTrader 5 and go to <b>File → Open Data Folder</b>.</p>
//               <p>3. Place the <b>ctrlcAPI.ex5</b> file in the <b>MQL5/Experts</b> folder.</p>
//               <p>4. Restart MetaTrader 5 and attach the EA to your chart.</p>
//               <p>5. Enable <b>Algo Trading</b> and check for successful connection.</p>

//               {/* Close Button */}
//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={() => setSetupGuide(false)}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//         <div className='w-[32rem] border rounded-xl p-12 m-4 text-md mb-4 h-fit space-y-4 bg-white'>
//           <h3 className='head_topic' >Add a Metatrader5 Account</h3>

//           {/* Toggle Button */}
//           <div className={`relative w-full p-4 flex items-center rounded-2xl border border-gray-300 cursor-pointer bg-gray-300 transition-all duration-300  ${setupGuide ? "opacity-0 " : "opacity-100 z-10"}`}   style={{ transition: setupGuide ? 'none' : 'all 0.3s ease-in-out' }} onClick={!setupGuide ? handleToggle : undefined} >
//             {/* Sliding Background */}
//             <div className={`absolute top-0 left-0 h-full w-1/2 rounded-2xl transition-all duration-300 bg-white ${isReal ? "translate-x-0" : "translate-x-full"}`} style={{ display: setupGuide ? 'none' : 'block' }}></div>
//             {/* Text Labels */}
//             <div className="relative flex w-full justify-between px-4 text-lg font-bold z-10">
//               <span className={isReal ? "text-black" : "text-white"}>Real</span>
//               <span className={isReal ? "text-white" : "text-black"}>Demo</span>
//             </div>
//           </div>

//           {/* Real Account Fields */}
//           {isReal && (
//             <div>
//               <div className='space-y-4'>
//                 <p className='text-xs text-gray-600'>
//                   To connect your MT5 account to CTRLC, download and set up our ctrlcAPI.
//                   Follow the setup guide below to securely link your MT5 account.
//                 </p>
//                 <div className='w-full bg-brandColor p-2 text-white rounded-lg text-center cursor-pointer'>
//                   Download ctrlcAPI
//                 </div>
//                 {/* <div className='text-xs text-blue-500 underline cursor-pointer' onClick={() => setSetupGuide(true)}>
//                   How to setup EA Metatrader5?
//                 </div> */}

//                 <h1 className='font-bold'>Token</h1>

//                 <div className="relative z-0  w-full max-w-md">
//                   <input type='text' className='w-full p-2 border rounded-lg' disabled autoComplete='on' value={token} />
//                   <button
//                     onClick={copyToClipboard}
//                     className="absolute inset-y-0 right-2 flex items-center p-1 text-gray-500 hover:text-gray-700"
//                   >
//                     <ClipboardCopy className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className='w-full flex items-center justify-center space-x-2 bg-brandColor p-2 text-white rounded-lg text-center cursor-pointer '
//                   onClick={generateToken}
//                 >
//                   <RefreshCcw className="w-5 h-5" />
//                   <span>Generate Token</span>
//                 </div>
//               </div>
//               <div className='my-12'>
//                 {(loading && !success) &&(
//                     <div className=''>
//                       <div className='loader '></div>
//                       <div className='mt-8 text-center text-gray-500 text-sm'>please connect your mt5 account in <CountdownTimer></CountdownTimer></div>
//                       {/* <div className='text-center text-gray-500 text-xs'>หากท่านเชื่อมต่อบัญชี MT5 ไม่สำเร็จกรุณารับ Token ใหม่อีกครั้งภายใน  </div> */}
//                     </div>
//                   )}
//                   {complete && (
//                     <div className=''>
//                       <div className='loader '></div>
//                       <div className='mt-8 text-center text-gray-500 '>
//                         <div className='text-lg'>connect success </div> 
//                         <div className='text-xs'>go to <Link href="/dashboard" className='text-blue-900 underline'>Dashboard?</Link> Connect <Link href="/dashboard" className='text-blue-900 underline'>More?</Link></div>


//                       </div>
//                       {/* <div className='text-center text-gray-500 text-xs'>หากท่านเชื่อมต่อบัญชี MT5 ไม่สำเร็จกรุณารับ Token ใหม่อีกครั้งภายใน  </div> */}
//                     </div>
//                   )}
//                   {uncomplete && (
//                     <div className=''>
//                       <div className='loader '></div>
//                       <div className='mt-8 text-center text-gray-500'>
//                         <div className='text-lg'>token timeout </div> 
//                         <div  className='text-xs'> generate new token and click Connect MT5 button again</div>
//                       </div>
//                       {/* <div className='text-center text-gray-500 text-xs'>หากท่านเชื่อมต่อบัญชี MT5 ไม่สำเร็จกรุณารับ Token ใหม่อีกครั้งภายใน  </div> */}
//                     </div>
//                 )}
//               </div>




//             </div>

//           )}

//           {/* Common Fields for Both Real & Demo */}

//           {/* Demo-Specific Fields */}
//           {!isReal && (
//             <>
//               <h1 className='font-bold'>Amount</h1>
//               <input type='number' placeholder='100-100000' className='w-full p-2 border rounded-lg hover:border-2 hover:border-brandColor focus:outline-brandColor' onChange={(e) => setAmount(e.target.value)} />

//               <h1 className='font-bold'>Leverage</h1>
//               <input type='number' className='w-full p-2 border rounded-lg hover:border-2 hover:border-brandColor focus:outline-brandColor' onChange={(e) => setLeverage(e.target.value)} />
//               <h1 className='font-bold'>Create Account Name</h1>
//               <input type='text' maxLength='20' className='w-full p-2 border rounded-lg hover:border-2 hover:border-brandColor focus:outline-brandColor' />
//             </>
//           )}


//           {/* Create Account Button */}
//           <Link href='/addaccount'>
//             <div className={`w-full duration-300 p-4 text-white rounded-lg text-center cursor-pointer mt-4 p-4 ${loading ? "bg-gray-300" : "bg-gray-600"}`}  onClick={loading ? undefined:CreateAccount }>
//               Connect MT5
//             </div>
//           </Link>
//           <div className='text-end text-xs text-blue-500 underline cursor-pointer' onClick={() => setSetupGuide(true)}>
//                 How to setup EA Metatrader5?
//           </div>
//         </div>
//       </div>

//     </Container>
//   )
// }

// export default Addaccount






































'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ClipboardCopy, RefreshCcw, ChevronRight, ArrowRight, Shield ,AlertTriangle ,LogIn} from "lucide-react";
import Link from 'next/link'
import cryptoRandomString from "crypto-random-string";
import { useSession } from "next-auth/react";
import Container from '../components/Container'



function Addaccount() {
  const { data: session } = useSession();

  const [isReal, setIsReal] = useState(true);
  const [setupGuide, setSetupGuide] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(true);
  const [complete, setComplete] = useState(false);
  const [uncomplete, setUncomplete] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [leverage, setLeverage] = useState(100);

  const handleToggle = () => {
    setIsReal(!isReal);
  };

  const generateToken = () => {
    const newToken = cryptoRandomString({ length: 32, type: "alphanumeric" });
    setToken(newToken);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
  };

  const CreateAccount = async () => {
    setComplete(false);
    setUncomplete(false);
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, user_id: session?.user?.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        alert(data.error || "Failed to verify token.");
      }

      if (data?.message) {
        setComplete(true)
      } else {
        setUncomplete(true)
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const CountdownTimer = ({ minutes = 5 }) => {
    const [timeLeft, setTimeLeft] = useState(minutes * 60);

    useEffect(() => {
      if (timeLeft <= 0) return;

      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (time) => {
      const mins = Math.floor(time / 60);
      const secs = time % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return <span className="font-mono text-xl">{formatTime(timeLeft)}</span>;
  };






  async function handleOnboard() {
    
    const response = await fetch('/api/create_stripe_master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email , user_id : session?.user?.id }) // Replace with actual email
    });

    const data = await response.json();
    if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
    } else {
        alert("❌ Error: " + data.error);
    }
    
  

  }


  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const handleNavigation = (e) => {
    console.log(" session?.user?.isOnboard   "  , session?.user?.isOnboard)
    if (!session?.user?.isOnboard) {
      e.preventDefault();
      setShowAuthNotification(true);
      
      // Auto hide notification after 5 seconds
      setTimeout(() => {
        setShowAuthNotification(false);
      }, 5000);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-blue-900 opacity-70"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Connect Your Account</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Link your MetaTrader 5 account to our platform and start copy trading with top-performing traders.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8">
        <div className="flex justify-center">
          {setupGuide && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 ">
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-md">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-cyan-400">Setup Guide for EA MetaTrader 5</h2>
                  <button onClick={() => setSetupGuide(false)} className="text-gray-400 hover:text-white">
                    ✖
                  </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                    <p>Download the <span className="font-semibold text-white">CTRLC.zip</span> file from our website.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                    <p>Open MetaTrader 5 and go to <span className="font-semibold text-white">File → Open Data Folder</span>.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                    <p>Place the <span className="font-semibold text-white">CTRLCapi.ex5</span> file in the <span className="font-semibold text-white">MQL5/Experts</span> folder.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</div>
                    <p>Place the <span className="font-semibold text-white">libsodium.dll </span> and <span className="font-semibold text-white">libzmq.dll </span>file in the <span className="font-semibold text-white">MQL5/Libraries</span> folder.</p>
                  </div>
               
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">5</div>
                    <p>Go to tools --- Options --- Expert Advisors</p>

                  </div>
                  <div className="flex items-start">
                    <img src="/tools.png"></img>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">5</div>
                    <p>Restart MetaTrader 5 and attach the EA to your chart.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">6</div>
                    <p>Enable <span className="font-semibold text-white">Algo Trading</span> and check for successful connection.</p>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setSetupGuide(false)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-xl">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-70"></div>
              <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Add a MetaTrader 5 Account
                </h3>

                {/* Toggle Button */}
                <div className="mb-6">
                  <div className="relative w-full p-1 flex items-center rounded-lg border border-gray-700 bg-gray-900 cursor-pointer">
                    {/* Sliding Background */}
                    <div className={`absolute top-1 left-1 h-10 w-1/2 rounded-md transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 ${isReal ? "translate-x-0" : "translate-x-full"}`}></div>
                    {/* Text Labels */}
                    <div className="relative flex w-full z-10">
                      <button
                        className={`w-1/2 h-10 text-center font-medium ${isReal ? "text-white" : "text-gray-400"}`}
                        onClick={() => setIsReal(true)}
                      >
                        Copy Account
                      </button>
                      <button
                        className={`w-1/2 h-10 text-center font-medium ${!isReal ? "text-white" : "text-gray-400"}`}
                        onClick={(e) => { handleNavigation(e) ;
                          if (session?.user?.isOnboard) {
                            setIsReal(false);
                          } 
                        }}  
                        // onClick={(e) => handleNavigation(e, item.link, item.protected)}
                      >
                        Master Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real Account Fields */}
               
                  <div className="space-y-6">
                    <p className="text-sm text-gray-400">
                      To connect your MT5 account to our platform, download and set up our ctrlcAPI.
                      Follow the setup guide to securely link your MT5 account.
                    </p>
                    <a href={isReal ? "/CTRLCSUB_API.zip" : "/CTRLCMASTER_API.zip"} download={isReal ? "CTRLCSUB_API.zip" : "CTRLCMASTER_API.zip"} >
                      <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center">
                        Download ctrlcAPI
                      </button>

                    </a>


                    <div className="space-y-2">
                      <label className="font-semibold flex items-center">
                        Your Connection Token
                        <Shield className="h-4 w-4 ml-2 text-cyan-400" />
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-cyan-500 focus:outline-none"
                          readOnly
                          value={token}
                        />
                        <button
                          onClick={copyToClipboard}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-cyan-400"
                        >
                          <ClipboardCopy className="w-5 h-5" />
                        </button>
                      </div>

                      <button
                        className="w-full py-3 bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                        onClick={generateToken}
                      >
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        <span>Generate Token</span>
                      </button>
                    </div>

                    <div className="mt-8 py-4">
                      {(loading && !success) && (
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 border-t-2 border-b-2 border-cyan-500 rounded-full animate-spin mx-auto"></div>
                          <div className="text-center text-gray-300">
                            Please connect your MT5 account within: <CountdownTimer />
                          </div>
                        </div>
                      )}

                      {complete && (
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-semibold text-green-400">Connection Successful!</div>
                            <div className="text-gray-400">
                              What would you like to do next?
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                              {/* <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:shadow-cyan-500/30 transition-all duration-300">
                                Go to Dashboard
                              </Link> */}
                              <Link href="/dashboard" className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg font-medium transition-all duration-300">
                                Go to Dashboard
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {uncomplete && (
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xl font-semibold text-red-400">Token Timeout</div>
                            <div className="text-gray-400">
                              Please generate a new token and try connecting again.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
               

                {/* Demo Account Fields */}
                {/* {!isReal && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-semibold">Initial Balance</label>
                      <input
                        type="number"
                        placeholder="100-100000"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-cyan-500 focus:outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Set your starting capital (100-100,000)</p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-semibold">Leverage</label>
                      <input
                        type="number"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-cyan-500 focus:outline-none"
                        value={leverage}
                        onChange={(e) => setLeverage(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Choose leverage between 1-1000</p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-semibold">Account Name</label>
                      <input
                        type="text"
                        maxLength="20"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-cyan-500 focus:outline-none"
                        placeholder="My Demo Account"
                      />
                      <p className="text-xs text-gray-500">Give your demo account a memorable name</p>
                    </div>
                  </div>
                )} */}

                {/* Connect Button */}
                <div className="mt-8">
                  <button
                    className={`w-full py-4 rounded-lg font-medium text-center transition-all duration-300 flex items-center justify-center ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg hover:shadow-cyan-500/30"}`}
                    onClick={loading ? undefined : CreateAccount}
                    disabled={loading}
                  >
                    Connect MT5 Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    className="text-cyan-400 text-sm hover:underline flex items-center justify-center mx-auto"
                    onClick={() => setSetupGuide(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to setup EA MetaTrader 5?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>







      {/* Authentication Notification - Top Right Animated */}
      {showAuthNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className="bg-gray-800 border-l-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/20 p-4 max-w-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-white">Authentication Required</h3>
                <div className="mt-2 text-sm text-gray-300">
                  <p>You need to be Add payment before create master account.</p>
                </div>
                <div className="mt-4">
                  <div onClick={handleOnboard}
                   
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Add payment
                    <ArrowRight className="h-4 w-4 ml-1 animate-bounceRight" />
                  </div>
                  <button
                    type="button"
                    className="ml-3 inline-flex items-center px-3 py-2 border border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                    onClick={() => setShowAuthNotification(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Addaccount