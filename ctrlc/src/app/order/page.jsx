// 'use client'
// import React, { useState, useEffect } from 'react'
// import Container from '../components/Container'
// import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
// import { DatePicker } from "antd";
// import { Table, Select, Button } from "antd";

// import Link from 'next/link'

// function Order() {

//   const { RangePicker } = DatePicker;
//   const { Option } = Select;
//   const [dateRange, setDateRange] = useState(null);
//   const [symbol, setSymbol] = useState("All");
//   const [side, setSide] = useState("All");
//   const [account, setAccount] = useState("All");
//   const [botName, setBotName] = useState("All");

//   const columns = [
//     { title: "Account", dataIndex: "account", key: "account" },
//     { title: "Side", dataIndex: "side", key: "side" },
//     { title: "Entry Time", dataIndex: "entryTime", key: "entryTime" },
//     { title: "Exit Time", dataIndex: "exitTime", key: "exitTime" },
//     { title: "Entry Price", dataIndex: "entryPrice", key: "entryPrice" },
//     { title: "Exit Price", dataIndex: "exitPrice", key: "exitPrice" },
//     { title: "Size", dataIndex: "size", key: "size" },
//     { title: "Profit", dataIndex: "profit", key: "profit" },

//   ];

//   const data = [
//     {
//       key: "1", id: '543425254235',
//       symbol:'XAUUSD',
//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: 167
//     },
//     {
//       key: "4", id: '543425254235',
//       symbol:'XAUUSD',

//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: -17
//     }, {
//       id: '543425254235',
//       symbol:'XAUUSD',

//       key: "5",
//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: -13
//     }, {
//       id: '543425254235',
//       symbol:'XAUUSD',

//       key: "6",
//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: 167
//     }, {      symbol:'XAUUSD',

//       id: '543425254235',

//       key: "7",
//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: 0
//     }, {
//       id: '543425254235',
//       key: "8",      symbol:'XAUUSD',

//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: 167
//     }, {
//       id: '543425254235',
//       key: "9",      symbol:'XAUUSD',

//       account: "demo2",
//       side: "Short",
//       entryTime: "07/01/2025 05:00:02",
//       exitTime: "09/01/2025 21:00:04",
//       entryPrice: "1.2344",
//       exitPrice: "1.2555",
//       size: 0.47,
//       profit: 167
//     },
//   ];

//   const handleSearch = () => {
//     console.log("Date Range:", dateRange);
//     console.log("Symbol:", symbol);
//     console.log("Side:", side);
//     console.log("Account:", account);
//     console.log("Bot Name:", botName);
//   };

//   return (
//     <Container>
      
//       <div className=' min-h-screen'>
//         <div className='head_topic'>Orders</div>
//         <div className='flex space-x-4 font-semibold my-4 text-lg'>
//           <Link  href={`/Strategy/${strategy.name}`}>
//             <div className='cursor-pointer  '>Stats</div>
//           </Link>
//           <div className='cursor-pointer border-brandColor border-b-4'>Orders</div>
//         </div>
//         <div className="">
//           <div className="flex flex-wrap items-center gap-4 mb-4">
//             <RangePicker
//               className="w-full md:w-1/4"
//               onChange={(dates) => setDateRange(dates)}
//               format="DD/MM/YYYY"
//             />
//             <Select
//               className="w-full md:w-1/5"
//               value={symbol}
//               onChange={(value) => setSymbol(value)}
//             >
//               <Option value="All">All</Option>
//               <Option value="EURUSD">EURUSD</Option>
//               <Option value="XAUUSD">XAUUSD</Option>
//             </Select>
//             <Select
//               className="w-full md:w-1/5"
//               value={side}
//               onChange={(value) => setSide(value)}
//             >
//               <Option value="All">All</Option>
//               <Option value="Long">Long</Option>
//               <Option value="Short">Short</Option>
//             </Select>
//             <Select
//               className="w-full md:w-1/5"
//               value={account}
//               onChange={(value) => setAccount(value)}
//             >
//               <Option value="All">All</Option>
//               <Option value="demo2">demo2</Option>
//               <Option value="sawadeekub">sawadeekub</Option>
//             </Select>
//             <Select
//               className="w-full md:w-1/5"
//               value={botName}
//               onChange={(value) => setBotName(value)}
//             >
//               <Option value="All">All</Option>
//               <Option value="Demo">Demo</Option>
//             </Select>
//             <div className="flex gap-2">
//               <Button type="primary" onClick={handleSearch}>
//                 Search
//               </Button>
//               <Button onClick={() => window.location.reload()}>Reset</Button>
//             </div>
//           </div>
//           {/* <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} /> */}

//           <div className="w-full border rounded-lg shadow-md bg-white">
//             {/* Table header */}
//             <div className='flex justify-between bg-gray-100 text-gray-700'>
//               <div className=" font-semibold p-4 rounded-t-lg">
//                 Order Details
//               </div>
//             </div>
//             {/* Table content */}
//             <div className="text-gray-600 p-4 space-y-4">
//               {/* Table Header Row */}
//               <div className="hidden md:flex justify-between text-sm font-semibold border-b pb-2">
//                 <div className="w-1/5">Order ID</div>
//                 <div className="w-1/5">Account</div>
//                 <div className="w-1/5">Side</div>
//                 <div className="w-1/5">Symbol</div>
//                 <div className="w-1/5">Entry Time</div>
//                 <div className="w-1/5">Exit Time</div>
//                 <div className="w-1/5">Entry Price</div>
//                 <div className="w-1/5">Exit Price</div>
//                 <div className="w-1/5">Profit</div>

//               </div>

//               {/* Table Rows */}
//               {data.map((data, idx) => (
//                 <div
//                   key={idx}
//                   className="flex flex-col md:flex-row justify-between items-center text-sm border-b pb-2 cursor-pointer hover:bg-gray-100 transition"
//                 // onClick={() => setSelectedBill(data)}
//                 >
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Order ID :</span>{data.id}</div>
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Account:</span>{data.account}</div>
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Side :</span>{data.side}</div>
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Symbol :</span>{data.symbol}</div>

//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Entry Time :</span>{data.entryTime}</div>
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Exit Time :</span>{data.exitTime}</div>
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Entry Price :</span>{data.entryPrice}</div>
//                   <div className="w-full md:w-1/5 mb-2 md:mb-0"><span className='md:hidden font-semibold'>Exit Price :</span>{data.exitPrice}</div>
//                   <div
//                     className={`w-full md:w-1/5 font-bold ${data.profit > 0
//                         ? 'text-profit'
//                         : data.profit === 0
//                           ? 'text-gray-600'
//                           : 'text-red-600'
//                       }`}
//                   >
//                     <span className='md:hidden font-semibold text-gray-600'>Profit :</span>{data.profit}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
      
//     </Container>

//   )
// }

// export default Order