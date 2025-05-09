//+------------------------------------------------------------------+
//|                                           register_to_server.mq5 |
//|                                  Copyright 2025, MetaQuotes Ltd. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, MetaQuotes Ltd."
#property link      "https://www.mql5.com"
#property version   "1.00"
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
#include <Zmq/Zmq.mqh> 
#include <Trade\Trade.mqh>
CTrade trade;



Context context("ea_signal_listener");  
Socket socket(context, ZMQ_REQ);
Socket socket_bills(context, ZMQ_REQ);
Socket socket_next(context,ZMQ_PUSH);

Socket sub_socket(context, ZMQ_SUB);
Socket sub_socket_next(context,ZMQ_SUB);
input string token;
input string mt5_name;        
string mt5_id = AccountInfoInteger(ACCOUNT_LOGIN);
string strategy_id;
string subscribed_id;
//double balance = AccountInfoDouble(ACCOUNT_BALANCE);


// Function to extract values from JSON manually
string ExtractJsonValue(string json, string key)
{
    string searchKey = key + ": ";
    int startPos = StringFind(json, searchKey);
    
    if (startPos == -1)
        return "";

    startPos += StringLen(searchKey);
    int endPos = StringFind(json, ",", startPos);

    if (endPos == -1)
        endPos = StringFind(json, "}", startPos);

    return StringTrim(StringSubstr(json, startPos, endPos - startPos));
}

// Helper function to trim spaces
string StringTrim(string text)
{
    while (StringLen(text) > 0 && (StringGetCharacter(text, 0) == ' ' || StringGetCharacter(text, StringLen(text) - 1) == ' '))
    {
        if (StringGetCharacter(text, 0) == ' ')
            text = StringSubstr(text, 1);
        if (StringGetCharacter(text, StringLen(text) - 1) == ' ')
            text = StringSubstr(text, 0, StringLen(text) - 1);
    }
    return text;
}


void OnInit()
  {
  
    if (!socket.connect("tcp://127.0.0.1:8888"))
    {
        Print("Failed to connect to Python server: ", GetLastError());
        return;
    }
    Print("EA successfully connected to Python .");
    
    
   
   
   EventSetTimer(1);
   // ส่งคำขอ Register
   string registerMsg = "{ \"type\": \"register\", \"mt5_id\": \"" + mt5_id + "\", \"token\": \"" + token + "\", \"account_name\": \"" + mt5_name + "\" }";
   
   ZmqMsg request(registerMsg);
   socket.send(registerMsg);
   
   ZmqMsg response;
   socket.recv(response);
   string responseString = response.getData();
   Print(responseString);
   
   string jsonString = StringReplace(responseString, "\"", ""); // Remove double quotes

   string status = ExtractJsonValue(responseString, "status");
   strategy_id = ExtractJsonValue(responseString, "subscribed");
   subscribed_id = ExtractJsonValue(responseString,"subscribed_id");
   Print(status);Print(strategy_id);
  // Print("ServerR esponse: ", status , "strategy_id ",strategy_id);
   
   
   
    
    
   
    Print("Connecting to PYTHON ZeroMQ Publisher...");
    
    if (!sub_socket.connect("tcp://127.0.0.1:9999"))
    {
      Print("Failed to connect to python server (sub): ", GetLastError());
      return;
    }
    
    Print("Connecting to NEXT ZeroMQ Publisher...");
   
    if (!sub_socket_next.connect("tcp://127.0.0.1:7777"))
    {
      Print("Failed to connect to next server (sub): ", GetLastError());
      return;
    }
    
    // sub for send trade_history to next
    sub_socket_next.setSubscribe(mt5_id);  
      
    // Subscribe for register , subscribed , unsubscribed and trade_signal
    sub_socket.setSubscribe(strategy_id);
    sub_socket.setSubscribe(mt5_id);
   
    if(socket.disconnect("tcp://127.0.0.1:8888")){
      Print("Close python socket for INIT");
    }
//---
   return;
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//--- destroy timer
   EventKillTimer();
   
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+

void OnTick()
  {
    ZmqMsg response;
    if(sub_socket.recv(response, ZMQ_DONTWAIT)) 
    {
       string message = response.getData();
       string parts[]; 
       string sep=",";                // A separator as a character 
       ushort u_sep;
       u_sep=StringGetCharacter(sep,0);
       StringSplit(message,u_sep,parts);
       
       
       // messsage maybe about subscribe strategy or trade_signal
       // sub,unsub strategy 
       if(parts[0] == mt5_id){ //unsub strategy    // "mt5_id,inactive,sub_id"
            if(parts[1] == "inactive"){   
               //stop use strategy
               sub_socket.setUnsubscribe(strategy_id);  
            }
            else if(parts[1] == "bills"){
               SendTradeDataForMonthlyBills();
            }
            else{ // sub new strategy     // "mt5_id,strategy_id,sub_id"
               
               sub_socket.setUnsubscribe(strategy_id) ;  //unsubscribe recent strategy
               strategy_id = parts[1];   // store recent strategy = new strategy
               subscribed_id = parts[2];
               sub_socket.setSubscribe(strategy_id); //subscribe recent strategy
            }        
       }
       else{//trade_signal
         string signal = parts[1];
         if (signal == "1") {
                     Print("Open buy: ", signal);
                     CloseAllPositions();
                     OpenBuyOrder();
                 } else if (signal == "2") {
                     Print("Open sell: ", signal);
                     CloseAllPositions();
                     OpenSellOrder();
                 }else{
                     Print("Hold", signal);
                 }
       }
       
       Print("strategy status or signal ", message);
    }
    //sub_socket.recv(response);
    //string message = response.getData();
    //string parts[]; 
    //string sep=",";                // A separator as a character 
    //ushort u_sep;
    //u_sep=StringGetCharacter(sep,0); 
    //StringSplit(message,u_sep,parts);
    
    
    
    ZmqMsg responseNEXT;
    if(sub_socket_next.recv(responseNEXT, ZMQ_DONTWAIT)) 
    {
       string message = responseNEXT.getData();
       string parts[]; 
       string sep=",";                // A separator as a character 
       ushort u_sep;
       u_sep=StringGetCharacter(sep,0);
       StringSplit(message,u_sep,parts);
       
       Print("test sub next " , message);
       // messsage maybe about subscribe strategy or trade_signal
    // sub,unsub strategy 
       if(message == "trade-request"){
         SendTradeData();
       }
  
       
    
    }
    
    
    
    
    //Print("sub-id  " , subscribed_id , "strategy_id ",strategy_id);
    
    
 
    
    
    
    
    
    
    
    
    
    
    
    
    
   
    
  }
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+


int position;
    
void OpenBuyOrder() {
    int longCount = 0;
    int shortCount = 0;
    int totalPositions = PositionsTotal();
    
    if(position >= 5 ){
      return;
    }
    
   
    double askPrice = SymbolInfoDouble(Symbol(), SYMBOL_ASK); // Get the ask price
    double lotSize = 0.1;
    double stopLoss = 0;
    double takeProfit = 0;
    
    string comment = subscribed_id;
    trade.Buy(lotSize, Symbol(), 0.0 , stopLoss, takeProfit, comment);
    //trade.Buy(lotSize, Symbol(), askPrice);
    position++;
   
}

void OpenSellOrder() {
    int longCount = 0;
    int shortCount = 0;
    int totalPositions = PositionsTotal();
    
    if(position <= -5){
      return;
    }
    
    double bidPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID); // Get the bid price
    double lotSize = 0.1;
    double stopLoss =0;
    double takeProfit = 0;
    
    string comment = subscribed_id;
    
    trade.Sell(lotSize, Symbol(), 0.0 , stopLoss, takeProfit, comment);
    
    
    //trade.Sell(lotSize, Symbol(), bidPrice,comment);
    position--;
}

void CloseAllPositions()
{
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
         double lotSize = PositionGetDouble(POSITION_VOLUME);
         string symbol = PositionGetString(POSITION_SYMBOL);

         MqlTradeRequest request;
         MqlTradeResult result;

         ZeroMemory(request);
         request.action = TRADE_ACTION_DEAL;
         request.symbol = symbol;
         request.volume = lotSize;
         request.type = (posType == POSITION_TYPE_BUY) ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
         request.position = ticket;
         request.price = SymbolInfoDouble(symbol, (posType == POSITION_TYPE_BUY) ? SYMBOL_BID : SYMBOL_ASK);
         request.deviation = 10;
         request.magic = 0;
         request.comment = subscribed_id;

         if(!OrderSend(request, result))
         {
            Print("Failed to close position: ", ticket, " Error: ", result.comment);
         }
      }
   }
   position=0;
}








void OnTimer()
  {
    ZmqMsg response;
    if(sub_socket.recv(response, ZMQ_DONTWAIT)) 
    {
       string message = response.getData();
       string parts[]; 
       string sep=",";                // A separator as a character 
       ushort u_sep;
       u_sep=StringGetCharacter(sep,0);
       StringSplit(message,u_sep,parts);
       
       
       // messsage maybe about subscribe strategy or trade_signal
       // sub,unsub strategy 
       if(parts[0] == mt5_id){ //unsub strategy    // "mt5_id,inactive,sub_id"
            if(parts[1] == "inactive"){   
               //stop use strategy
               sub_socket.setUnsubscribe(strategy_id);  
            }
            else if(parts[1] == "bills"){
               SendTradeDataForMonthlyBills();
            }
            else{ // sub new strategy     // "mt5_id,strategy_id,sub_id"
               
               sub_socket.setUnsubscribe(strategy_id) ;  //unsubscribe recent strategy
               strategy_id = parts[1];   // store recent strategy = new strategy
               subscribed_id = parts[2];
               sub_socket.setSubscribe(strategy_id); //subscribe recent strategy
            }        
       }
       else{//trade_signal
         string signal = parts[1];
         if (signal == "1") {
                     Print("Open buy: ", signal);
                     CloseAllPositions();
                     OpenBuyOrder();
                 } else if (signal == "2") {
                     Print("Open sell: ", signal);
                     CloseAllPositions();
                     OpenSellOrder();
                 }else{
                     Print("Hold", signal);
                 }
       }
       
       Print("strategy status or signal ", message);
    }
    //sub_socket.recv(response);
    //string message = response.getData();
    //string parts[]; 
    //string sep=",";                // A separator as a character 
    //ushort u_sep;
    //u_sep=StringGetCharacter(sep,0); 
    //StringSplit(message,u_sep,parts);
    
    
    
    ZmqMsg responseNEXT;
    if(sub_socket_next.recv(responseNEXT, ZMQ_DONTWAIT)) 
    {
       string message = responseNEXT.getData();
       string parts[]; 
       string sep=",";                // A separator as a character 
       ushort u_sep;
       u_sep=StringGetCharacter(sep,0);
       StringSplit(message,u_sep,parts);
       
       Print("test sub next " , message);
       // messsage maybe about subscribe strategy or trade_signal
    // sub,unsub strategy 
       if(message == "trade-request"){
         SendTradeData();
       }
  
       
    
    }
    
    
    
    
    //Print("sub-id  " , subscribed_id , "strategy_id ",strategy_id);
    
    
 
    
    
    
    
    
    
    
    
    
    
    
    
    
   
    
   
   
  }
//+------------------------------------------------------------------+
//| Trade function                                                   |
//+------------------------------------------------------------------+


void SendTradeData() {
    if (!socket_next.connect("tcp://127.0.0.1:6666"))
    {
        Print("Failed to connect to NEXTserver: ", GetLastError());
        return;
    }
    Print("EA successfully connected to NEXT ");
    double balance = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity  = AccountInfoDouble(ACCOUNT_EQUITY);
    string jsonData = "{ \"mt5_id\": \"" + mt5_id + "\", \"balance\": \"" + balance + "\", \"equity\": \"" + equity + "\", \"strategie_id\": \"" + strategy_id + "\", \"subscribed_id\": \"" + subscribed_id + "\", \"positions\": [";
    int TARGET_MAGIC_NUMBER = 123456;  // Replace with your actual MAGIC_NUMBER
    
    // Get open positions
    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        ulong ticket = PositionGetTicket(i);
        
            int sub_id = PositionGetInteger(POSITION_MAGIC);
            if (true) {  // Filter only positions with the specific MAGIC_NUMBER              
                string symbol = PositionGetString(POSITION_SYMBOL);
                double volume = PositionGetDouble(POSITION_VOLUME);
                double price = PositionGetDouble(POSITION_PRICE_OPEN);
                double profit = PositionGetDouble(POSITION_PROFIT);
                datetime time = PositionGetInteger(POSITION_TIME);
                string type = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? "BUY" : "SELL";
                string comment = PositionGetString(POSITION_COMMENT);
                 
                 
                Print(symbol + "  " + volume + "  " + price + "  " + type);
                jsonData += "{ \"id_pos\": " + IntegerToString(ticket) +  // Fixed key name
                              ", \"symbol\": \"" + symbol + "\"" +
                              ", \"volume\": " + DoubleToString(volume, 2) +
                              ", \"price\": " + DoubleToString(price, 5) +
                               ", \"type\": \"" + type + "\"" +    // Ensure `type` is inside quotes
                              ", \"profit\": \"" + DoubleToString(profit) + "\"" +
                             ", \"time\": \"" + TimeToString(time) + "\"" +
                              ", \"comment\": \"" + comment + "\" },";
            }
        
    }
    
    
    // Get closed orders (trades)
    //HistorySelect(TimeCurrent() - 86400 * 300, TimeCurrent());  // Select history for the last 30 days (for example)
    //int historyTotal = HistoryOrdersTotal(); // Get total number of closed orders
    //Print(historyTotal);
    HistorySelect(0, TimeCurrent()); // Select from epoch to current time
    int historyTotal = HistoryOrdersTotal(); // Get total number of closed orders
    Print("Total history orders: ", historyTotal);
     // สร้าง map เก็บ positions
    long positionMap[];  // เก็บ position IDs ที่เจอแล้ว
    int positionCount = 0;
    for (int i = 0 ; i <= historyTotal ;  i++) {
    
        ulong ticket = HistoryDealGetTicket(i); // Get the ticket for the closed order
       
       
        //Print("Attempting to select order with ticket: ", ticket);
        if(ticket == 0){
            continue;
        }
         // เช็คว่าเป็น deal ที่ปิด position
        ENUM_DEAL_ENTRY dealEntry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY);
        if (dealEntry != DEAL_ENTRY_OUT) continue;  // สนใจแค่ exit deals
        
        double dealProfit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
        long positionId = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
        
        // เช็คว่าเคยเจอ position นี้หรือยัง
        bool found = false;
        for (int j = 0; j < positionCount; j++)
        {
            if (positionMap[j] == positionId)
            {
                found = true;
                break;
            }
        }
        if (found) continue;  // ข้าม position ที่เคยเจอแล้ว
        
        // เพิ่ม position ID ใหม่
        ArrayResize(positionMap, positionCount + 1);
        
        
        
        positionMap[positionCount++] = positionId;
            int sub_id = HistoryDealGetInteger(ticket,DEAL_MAGIC); // Retrieve the magic number
            if (true) {  // Filter only orders with the specific MAGIC_NUMBER                sub_id == TARGET_MAGIC_NUMBER
                string symbol = HistoryDealGetString(ticket,DEAL_SYMBOL); // Symbol of the order
                double volume = HistoryDealGetDouble(ticket,DEAL_VOLUME); // Volume of the order
                double price = HistoryDealGetDouble(ticket,DEAL_PRICE); // Open price of the order
                string type = (HistoryDealGetInteger(ticket,DEAL_TYPE) == DEAL_TYPE_BUY) ? "BUY" : "SELL"; // Order type
                datetime dealTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
                 string comment = HistoryDealGetString(ticket, DEAL_COMMENT); // Get the comment of the closed order

             
                jsonData += "{ \"id\": " + IntegerToString(ticket) +  // Fixed key name
                              ", \"symbol\": \"" + symbol + "\"" +
                              ", \"volume\": " + DoubleToString(volume, 2) +
                              ", \"price\": " + DoubleToString(price, 5) +
                               ", \"type\": \"" + type + "\"" +    // Ensure `type` is inside quotes
                              ", \"profit\": \"" + DoubleToString(dealProfit) + "\"" +
                               ", \"time\": \"" + TimeToString(dealTime) + "\"" +
                                ", \"comment\": \"" + comment + "\" },";

            }
       
    }


    if (StringLen(jsonData) > 0 && StringSubstr(jsonData, StringLen(jsonData) - 1, 1) == ",") {
        jsonData = StringSubstr(jsonData, 0, StringLen(jsonData) - 1); // Remove last comma
    }
    jsonData += "]}"; // Close JSON
    Print(jsonData);
    //SendToNextJs(jsonData);
    
    
    
   
   if (!socket_next.send(jsonData)) {
      Print("Failed to send trade history: ");
   } else {
      Print("Trade history sent successfully: ");
   }
   if (socket_next.disconnect("tcp://127.0.0.1:6666")){
      Print("close send history socket");
   }
   
   //string jsonString = StringReplace(responseString, "\"", ""); // Remove double quotes

   //string status = ExtractJsonValue(responseString, "status");
   //strategy_id = ExtractJsonValue(responseString, "subscribed");
   //subscribed_id = ExtractJsonValue(responseString,"subscribed_id");
   //Print(status);Print(strategy_id);
}






























void SendTradeDataForMonthlyBills() {
     if (!socket.connect("tcp://127.0.0.1:8888"))
    {
        Print("Failed to connect to schedule: ", GetLastError());
        return;
    }
    Print("EA successfully connected to Python schedule, send trade history for create Bills.");
   
   
    string jsonData = "{ \"type\": \"bills\", \"mt5_id\": \"" + mt5_id + "\", \"token\": \"" + token + "\", \"account_name\": \"" + mt5_name + "\", \"positions\": [";
   
    HistorySelect(TimeCurrent() - 30 * 86400, TimeCurrent()); // Select last 30 days
    int historyTotal = HistoryOrdersTotal(); // Get total number of closed orders
    Print("Total history orders: ", historyTotal);
  
    long positionMap[];  // เก็บ position IDs ที่เจอแล้ว
    int positionCount = 0;
    for (int i = 0 ; i <= HistoryDealsTotal() ;  i++) {
    
        ulong ticket = HistoryDealGetTicket(i); // Get the ticket for the closed order
       
       
        //Print("Attempting to select order with ticket: ", ticket);
        if(ticket == 0){
            continue;
        }
         // เช็คว่าเป็น deal ที่ปิด position
        ENUM_DEAL_ENTRY dealEntry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY);
        if (dealEntry != DEAL_ENTRY_OUT) continue;  // สนใจแค่ exit deals
        
        double dealProfit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
        long positionId = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
        
        // เช็คว่าเคยเจอ position นี้หรือยัง
        bool found = false;
        for (int j = 0; j < positionCount; j++)
        {
            if (positionMap[j] == positionId)
            {
                found = true;
                break;
            }
        }
        if (found) continue;  // ข้าม position ที่เคยเจอแล้ว
        
        // เพิ่ม position ID ใหม่
        ArrayResize(positionMap, positionCount + 1);
        
        
        
        positionMap[positionCount++] = positionId;
            int sub_id = HistoryDealGetInteger(ticket,DEAL_MAGIC); // Retrieve the magic number
            if (true) {  // Filter only orders with the specific MAGIC_NUMBER                sub_id == TARGET_MAGIC_NUMBER
                string symbol = HistoryDealGetString(ticket,DEAL_SYMBOL); // Symbol of the order
                double volume = HistoryDealGetDouble(ticket,DEAL_VOLUME); // Volume of the order
                double price = HistoryDealGetDouble(ticket,DEAL_PRICE); // Open price of the order
                string type = (HistoryDealGetInteger(ticket,DEAL_TYPE) == DEAL_TYPE_BUY) ? "BUY" : "SELL"; // Order type
                datetime dealTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
                 string comment = HistoryDealGetString(ticket, DEAL_COMMENT); // Get the comment of the closed order

             
                jsonData += "{ \"id\": " + IntegerToString(ticket) +  // Fixed key name
                              ", \"symbol\": \"" + symbol + "\"" +
                              ", \"volume\": " + DoubleToString(volume, 2) +
                              ", \"price\": " + DoubleToString(price, 5) +
                               ", \"type\": \"" + type + "\"" +    // Ensure `type` is inside quotes
                              ", \"profit\": \"" + DoubleToString(dealProfit) + "\"" +
                               ", \"time\": \"" + TimeToString(dealTime) + "\"" +
                                ", \"comment\": \"" + comment + "\" },";

            }
       
    }


    if (StringLen(jsonData) > 0 && StringSubstr(jsonData, StringLen(jsonData) - 1, 1) == ",") {
        jsonData = StringSubstr(jsonData, 0, StringLen(jsonData) - 1); // Remove last comma
    }
    jsonData += "]}"; // Close JSON
    Print(jsonData);
  
   
   
   ZmqMsg request(jsonData);
   socket.send(jsonData);
   
   ZmqMsg response;
   socket.recv(response);
   string responseString = response.getData();
   Print("create bills dont forget to paid"  , responseString);
   
    if (socket.disconnect("tcp://127.0.0.1:8888")){
      Print("close bills socket");
   }
}
