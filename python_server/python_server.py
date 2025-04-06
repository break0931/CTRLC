import zmq
import json
from pymongo import MongoClient
from pymongo import errors
import datetime
import math
from bson import ObjectId
# ตั้งค่า MongoDB
client = MongoClient("mongodb+srv://atckskul:codeine0931@cluster0.nsara.mongodb.net/Copytrading?retryWrites=true&w=majority&appName=Cluster0")  # เปลี่ยนเป็น URI จริงของคุณ
db = client["Copytrading"]
subscriptions = db["subscribes"]
strategies = db["strategies"]
tokens = db["tokens"]
mt5_accounts = db["mt5_accounts"]
bills = db["bills"]
users = db["users"]
# ZeroMQ Context
context = zmq.Context()

# 1️⃣ Socket to Receive Trade Signals from Master EA (ROUTER)
router_socket = context.socket(zmq.ROUTER)
router_socket.bind("tcp://*:8888")  # Master EA connects here



# 2️⃣ Socket to Publish Trade Signals (PUB)
pub_socket = context.socket(zmq.PUB)
pub_socket.bind("tcp://*:9999")  # Clients EA subscribe to this
client_map = {}
print("Python Server is running...")
# Watch for new insertions in the "subscribes" collection



import threading


def watch_subscriptions():
    with subscriptions.watch([{"$match": {"operationType": {"$in": ["insert", "update"]}}}]) as stream:
        for change in stream:
            operation = change["operationType"]

            # Handle new subscriptions (insert)
            if operation == "insert":
                if "fullDocument" in change:
                    full_doc = change["fullDocument"]
                    strategy_id = full_doc.get("strategie_id")
                    mt5_id = full_doc.get("mt5_id")
                    sub_id = full_doc.get("_id")

                    
                    strategies_entry = strategies.find_one({"_id" : strategy_id})
                
                    if strategies_entry is not None:
                        master_mt5_id = strategies_entry.get("mt5_id")  


                    pub_socket.send_string(f"{mt5_id},{master_mt5_id},{sub_id}")
                    print("✅ New subscription detected:", full_doc)

            # Handle updates (status change detection)   
            #inactive strategy
            elif operation == "update":
                updated_fields = change.get("updateDescription", {}).get("updatedFields", {})

                if "status" in updated_fields:
                    new_status = updated_fields["status"]
                    document_id = change["documentKey"]["_id"]  # Get the document ID
                    full_doc = subscriptions.find_one({"_id": document_id})
                    
                    strategy_id = full_doc.get("strategie_id")
                    mt5_id = full_doc.get("mt5_id")

                    strategies_entry = strategies.find_one({"_id" : strategy_id})
                
                    if strategies_entry is not None:
                        master_mt5_id = strategies_entry.get("mt5_id") 

                    print(f"✅ Subscription {document_id} status changed to {new_status}")

                    if new_status == "inactive" :
                        pub_socket.send_string(f"{mt5_id},{new_status},{master_mt5_id}")
                        print(f"❌ Subscription {document_id} is now ❌ inactive.")

            else:
                print("Unknown change detected:", change)

# Running both watchers in separate threads
# mt5_thread = threading.Thread(target=watch_mt5_accounts, daemon=True)
sub_thread = threading.Thread(target=watch_subscriptions, daemon=True)

# mt5_thread.start()
sub_thread.start()


import schedule
import datetime
import time




# Function to run scheduled tasks
def run_schedule():
    while True:
        schedule.run_pending()
        time.sleep(60 * 60)  # Sleep for 1 hour before checking again

# Start the scheduling in a separate thread
schedule_thread = threading.Thread(target=run_schedule, daemon=True)
schedule_thread.start()




def send_trade_history_for_create_bills():
    print("schedule " )
    all_mt5_accounts = mt5_accounts.find({"account_type": "subscriber"}, {"mt5_id": 1})
    print(all_mt5_accounts)
    for account in all_mt5_accounts:
        mt5_id = account.get("mt5_id")
        if mt5_id:
            pub_socket.send_string(f"{mt5_id},bills")
            print(f"✅ Requested trade history for MT5 ID: {mt5_id}")

schedule.every(30).days.do(send_trade_history_for_create_bills)




def check_and_update_bills():
    """
    Check for due bills, update their status, and manage MT5 accounts
    """
    try:
     
        current_date = datetime.datetime.now()
        
        # Find bills that are due and not yet expired
        due_bills = bills.find({
            "status": {"$eq": "Unpaid"},
            "due_date": {"$lt": current_date}
        })
        
        for bill in due_bills:
            # Update bill status to Expired
            bills.update_one(
                {"_id": bill["_id"]},
                {"$set": {"status": "Expired"}}
            )
            
            # Check if the bill is associated with an MT5 account
            mt5_id = bill.get("mt5_id")
            if mt5_id:

                mt5_accounts.update_one(
                    {"mt5_id": mt5_id},
                    {"$set": {
                        "status": "banned",
                    }}
                )
                print(f"🚫 Account {mt5_id} ❌ banned due to expired bills")
               
                # Optional: Send notification about expired bill
                print(f"📅 Bill {bill['_id'] } for MT5 ID {mt5_id} marked as Expired")

                subscriptions.update_one(
                    {"mt5_id": mt5_id, "status": "active"},
                    {"$set": {
                        "status": "inactive"
                    }}
                )
        print("✅ Bill status update complete")
    
    except Exception as e:
        print(f"❌ Error in bill status update: {e}")


# schedule.every(1).minutes.do(check_and_update_bills)
schedule.every().day.at("00:00").do(check_and_update_bills)



def create_bill(mt5_id, positions):
    # Group profits and bill details by master MT5 ID
    master_bills = {}
    master_profits = {}

    for position in positions:
        ticket = position.get("id")
        symbol = position.get("symbol")
        volume = position.get("volume")
        price = position.get("price")
        type_of_trade = position.get("type")
        profit = position.get("profit")
        time = position.get("time")
        comment = position.get("comment")

        try:
            profit = float(profit) if profit is not None else 0.0
        except (ValueError, TypeError):
            profit = 0.0

        if comment:
            try:
                subscribed_entry = subscriptions.find_one({"_id": ObjectId(comment)})
                if subscribed_entry:
                    strategy_id = subscribed_entry.get('strategie_id')
                    if strategy_id:
                        strategy_entry = strategies.find_one({"_id": strategy_id})
                        if strategy_entry:
                            master_mt5_id = strategy_entry.get('mt5_id')
                            isCTRLC = strategy_entry.get('isCTRLC')
                            master_stripe_account = ""
                            
                            if not isCTRLC:
                                mt5_accounts_entry = mt5_accounts.find_one({"mt5_id": master_mt5_id})
                                token = mt5_accounts_entry.get("token")
                                tokens_entry = tokens.find_one({"token": token})    
                                user_id = tokens_entry.get("user_id")
                                users_entry = users.find_one({"_id": user_id})
                                isOnboard = users_entry.get("isOnboard")
                                master_stripe_account = users_entry.get("stripe_account")
                            
                            # Sum up profit for each master MT5 ID
                            if master_mt5_id not in master_profits:
                                master_profits[master_mt5_id] = 0.0
                                master_bills[master_mt5_id] = {
                                    "strategy_id": strategy_entry.get('_id'),
                                    "commission": strategy_entry.get("commission"),
                                    "master_stripe_account": master_stripe_account,
                                    "isCTRLC": isCTRLC
                                }
                            
                            master_profits[master_mt5_id] += profit

            except Exception as e:
                print(f"❌ Error processing bill for comment {comment}: {e} ❌ not form platdform")

    # Create bills only if total profit is greater than 0
    for master_mt5_id, total_profit in master_profits.items():
        if total_profit > 0:
            commission_rate = master_bills[master_mt5_id]["commission"] / 100
            bill_amount = total_profit * commission_rate
            
            bill_entry = {
                "mt5_id": mt5_id,
                "strategy_id": master_bills[master_mt5_id]["strategy_id"],
                "amount": math.ceil(bill_amount),
                "master_stripe_account": master_bills[master_mt5_id]["master_stripe_account"],
                "isCTRLC": master_bills[master_mt5_id]["isCTRLC"],
                "status": "Unpaid",
                "bill_created": datetime.datetime.now(),
                "due_date": datetime.datetime.now() + datetime.timedelta(days=15),
            }
            try:
                bills.insert_one(bill_entry)
                print(f"✅ {mt5_id} Bill created for Master MT5 ID: {master_mt5_id}, "
                      f"✅ Bill amount : {total_profit}, "
                      f"Amount: {bill_entry['amount']}, "
                      f"Due Date: {bill_entry['due_date']}")
            except errors.PyMongoError as e:
                print(f"❌ Error inserting bill into the database: {e}")
        else : 
            print(f"❌ profit < 0")




# Schedule for processing trade history monthly
def process_trade_history(mt5_id, positions):
    # Use the create_bill function to insert the trade history as a bill
    create_bill(mt5_id, positions)







while True:
    # Receive trade signal from Master EA
    client_address, empty, message = router_socket.recv_multipart()
    message_data = json.loads(message.decode())

    #print(message_data)

    request_type = message_data.get("type") 
    print("request type "  , request_type)
    mt5_id = message_data.get("mt5_id") 
    account_name = message_data.get("account_name")
    account_type =  message_data.get("account_type")
    token = message_data.get("token")
    positions = message_data.get("positions", [])
    trade_signal = message_data.get("trade_signal")
    #print(len(positions))
    if request_type == "bills":
        
        # Handle trade history and generate bill
        process_trade_history(mt5_id, positions)
        # Send acknowledgment back to EA
        router_socket.send_multipart([client_address, b"", zmq.utils.jsonapi.dumps({"status": "Bills processed"})])

    
    if request_type == "register":
        # Client EA ส่งคำขอ Register (บันทึก mt5_id กับ Client Address)
        client_map[mt5_id] = client_address
        mt5_entry = mt5_accounts.find_one({"mt5_id":mt5_id})
        
        #Check MT5 already register?
        if not mt5_entry:
            # Validation token 
            tokens_entry = tokens.find_one({"token": token})

            if not tokens_entry: #Invalid token
                router_socket.send_multipart([client_address, b"", zmq.utils.jsonapi.dumps({"status": "invalid token","mt5.id": "none","subscribed":"none"})])
            else:

                existing_name = mt5_accounts.find_one({"mt5_name": account_name})
                existing_token = mt5_accounts.find_one({"token": token})
                
                if existing_name:
                    print("❌ Duplicate mt5_name found!")

                    # Notify EA that the name is already taken
                    router_socket.send_multipart([
                        client_address, b"",
                        zmq.utils.jsonapi.dumps({"status": "error","error": "duplicate_name","message": "MT5 Name already exists.","subscribed": "none"})
                    ])

                elif existing_token:
                    print("❌ Duplicate token found!")
                    # Notify EA that the token is already taken
                    router_socket.send_multipart([
                        client_address, b"",
                        zmq.utils.jsonapi.dumps({"status": "error","error": "duplicate_token","message": "Token already exists.","subscribed": "none" })
                    ])

                else:
                    # No duplicates found, proceed with insertion
                    document = {"mt5_name": account_name,"mt5_id": mt5_id,"token": token,"account_type": account_type,"status": "active"}
                    result = mt5_accounts.insert_one(document)
                    print("✅ Registered new MT5 account.")

                    if (account_type == "master"):
                        document = {"name": account_name,"timeframe" : "All","commission" : 15 ,"symbol" : "All" ,"mt5_id": mt5_id, "traders": 0 , "start_date" : datetime.datetime.now(), "isCRTLC" : False}
                        strategies.insert_one(document)
                        print("✅ Registered new Strategies.")
                    # Notify EA of successful registration
                    router_socket.send_multipart([
                        client_address, b"",
                        zmq.utils.jsonapi.dumps({"status": "registered","mt5.id": mt5_id,"subscribed": "none"})
                    ])
        else:
            subscriptions_entry = subscriptions.find_one({"mt5_id": mt5_id,"status":"active"})
            if subscriptions_entry:
                subscribed_id = str(subscriptions_entry["_id"])

                sub_strategy_id = subscriptions_entry["strategie_id"]
                strategies_entry = strategies.find_one({"_id" : sub_strategy_id})
               
                
                if strategies_entry is not None:
                    master_mt5_id = strategies_entry.get("mt5_id")  # Use `.get()` to avoid KeyError
                else:
                    print("Error: strategies_entry is None")
                router_socket.send_multipart([client_address, b"", zmq.utils.jsonapi.dumps({"status": "Re-install-EA","mt5.id": mt5_id,"subscribed": master_mt5_id ,"subscribed_id": subscribed_id})])
            else:
                router_socket.send_multipart([client_address, b"", zmq.utils.jsonapi.dumps({"status": "Re-install-EA but No-strategy-found","mt5.id": "no mt5","subscribed":"none"})])


        continue


    if request_type == "trade":
        # Master EA ส่ง Trade Signal (buy/sell) พร้อม mt5_id มา
        if not mt5_id :
            router_socket.send_multipart([client_address, b"", zmq.utils.jsonapi.dumps({"error": "Invalid data"})])
            continue
        # Log received trade signal
        entry = message_data.get("Entry") 
        volume = message_data.get("Volume") 
        price = message_data.get("Price") 
        symbol = message_data.get("Symbol") 
        ticket = message_data.get("PositionTicket")
        deal_type = message_data.get("deal_type")
        print(f"Received trade signal for mt5_id {mt5_id}: {entry} : deal_type {deal_type} : Volume : {volume} : Price : {price} : Symbol : {symbol} : ticket : {ticket}")
        
        # strategy_entry = strategies.find_one({"mt5_id": str(mt5_id)})
     
        # if strategy_entry:
        #     strategy_id = strategy_entry["_id"]
          
            # Publish trade signal with strategy_id as topic
        pub_socket.send_string(f"{mt5_id},{entry},{deal_type},{symbol},{volume},{ticket},{mt5_id}")
     
        # Send acknowledgment back to Master EA
        router_socket.send_multipart([client_address, b"", json.dumps({"status": "Trade signal published"}).encode()])

   
