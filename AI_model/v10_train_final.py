import neat
import pandas as pd
import random
import numpy as np
import pickle

# Set random seeds for reproducibility
random.seed(0)
np.random.seed(0)
neat.Config.random_seed = 0




# Load the dataset
data = pd.read_csv("USDJPY_2005-2020_D1.csv")

        # Pre-normalize all data columns
data[ 'norm_close_minus_trendline_7'] = (data['close_minus_trendline_7'] - data['close_minus_trendline_7'].mean()) / data['close_minus_trendline_7'].std()
data['norm_close_minus_trendline_21'] = (data['close_minus_trendline_21'] - data['close_minus_trendline_21'].mean()) / data['close_minus_trendline_21'].std()
data['norm_close_minus_trendline_89'] = (data['close_minus_trendline_89'] - data['close_minus_trendline_89'].mean()) / data['close_minus_trendline_89'].std()
data['norm_close_minus_trendline_200'] = (data['close_minus_trendline_200'] - data['close_minus_trendline_200'].mean()) / data['close_minus_trendline_200'].std()

data[ 'norm_close_minus_ema_7'] = (data['close_minus_ema7'] - data['close_minus_ema7'].mean()) / data['close_minus_ema7'].std()
data[ 'norm_close_minus_ema_21'] = (data['close_minus_ema21'] - data['close_minus_ema21'].mean()) / data['close_minus_ema21'].std()
data[ 'norm_close_minus_ema_89'] = (data['close_minus_ema89'] - data['close_minus_ema89'].mean()) / data['close_minus_ema89'].std()
data[ 'norm_close_minus_ema_200'] = (data['close_minus_ema200'] - data['close_minus_ema200'].mean()) / data['close_minus_ema200'].std()

data[ 'norm_price_diff'] = (data['price_diff'] - data['price_diff'].mean()) / data['price_diff'].std()
data[ 'norm_volume'] = (data['tick_volume'] - data['tick_volume'].mean()) / data['tick_volume'].std()

# Define the trading environment
class TradingEnvironment:
    def __init__(self, data, capital=10000):
        self.data = data
        self.capital = capital
       
       
        self.position = 0  # จำนวนสถานะที่เปิดอยู่ (สามารถเป็น +5 ถึง -5)
        self.entry_prices = []  # เก็บราคาเปิดของแต่ละสถานะ
        self.index = 0  # ตำแหน่งของข้อมูลที่ใช้
        self.last_action = None
        self.entry_indexs = []
        self.unrealized_long_pnl = 0
        self.unrealized_short_pnl = 0
      
      
   
    def get_state(self):
        if self.index >= len(self.data):
            return None
    
        norm_price_diff = self.data.iloc[self.index]['norm_price_diff']
        norm_volume = self.data.iloc[self.index]['norm_volume']

        norm_close_minus_trendline_7 = self.data.iloc[self.index]['norm_close_minus_trendline_7']
        norm_close_minus_trendline_21 = self.data.iloc[self.index]['norm_close_minus_trendline_21']
        norm_close_minus_trendline_89 = self.data.iloc[self.index]['norm_close_minus_trendline_89']
        norm_close_minus_trendline_200 = self.data.iloc[self.index]['norm_close_minus_trendline_200']


        norm_close_minus_ema7 = self.data.iloc[self.index]['norm_close_minus_ema_7']
        norm_close_minus_ema21 = self.data.iloc[self.index]['norm_close_minus_ema_21']
        norm_close_minus_ema89 = self.data.iloc[self.index]['norm_close_minus_ema_89']
        norm_close_minus_ema200 = self.data.iloc[self.index]['norm_close_minus_ema_200']

        trend_7 = self.data.iloc[self.index]["trend_7"]
        trend_21 = self.data.iloc[self.index]["trend_21"]
        trend_89 = self.data.iloc[self.index]["trend_89"]
        trend_200 = self.data.iloc[self.index]["trend_200"]




        num_long = max(self.position, 0)   # If position > 0, store in num_long
        num_short = abs(min(self.position, 0))  # If position < 0, store in num_short


        # Calculate unrealized profit/loss before taking action
        self.unrealized_long_pnl = 0
        self.unrealized_short_pnl = 0


        if len(self.entry_prices) > 0:
            current_price = self.data.iloc[self.index]['close']
            
        for i, entry_price in enumerate(self.entry_prices):
            # Determine if this position is long or short
            is_long = self.position > 0
            
            # Calculate PnL for this position
            if is_long:
                self.unrealized_long_pnl += (current_price - entry_price) * ((self.capital / 5) / entry_price)
                self.unrealized_pnl += (current_price - entry_price) * ((self.capital / 5) / entry_price) 
 
            else:
                self.unrealized_short_pnl += (entry_price - current_price) *  ((self.capital / 5) / entry_price)
                self.unrealized_pnl += (entry_price - current_price) *  ((self.capital / 5) / entry_price)   

            
        norm_unrealized_long_pnl = self.unrealized_long_pnl / self.capital
        norm_unrealized_short_pnl = self.unrealized_short_pnl / self.capital
        norm_unrealized_pnl = self.unrealized_pnl / self.capital

        return [ norm_close_minus_trendline_7 , norm_close_minus_ema7 , trend_7,
                 norm_close_minus_trendline_21 , norm_close_minus_ema21 , trend_21,  
                 norm_close_minus_trendline_89 , norm_close_minus_ema89 , trend_89,  
                 norm_close_minus_trendline_200 , norm_close_minus_ema200 , trend_200
                ,norm_price_diff, norm_volume, num_long, num_short , norm_unrealized_long_pnl , norm_unrealized_short_pnl   ]
    
    def step(self, action):
        
        current_price = self.data.iloc[self.index]['close']
   
        reward=0
        realized_profit = 0



        isCutloss = False

        if action == 1:  # เปิด Long
            if self.position < 0:  # มี Short 
                realized_profit = self.close_all_positions(current_price)
                if self.unrealized_short_pnl < 0 : 
                    reward += abs(self.unrealized_short_pnl) * 0.2 # cut loss
                    isCutloss = True
            if self.position < 5:  # เปิดเพิ่มได้สูงสุด 5 ตำแหน่ง
                self.position += 1
                self.entry_prices.append(current_price)
                self.entry_indexs.append(self.index)   
            if self.unrealized_long_pnl < 0 and not isCutloss:
                reward -= abs(self.unrealized_long_pnl) * 0.1 # opening new positions while already in a losing position
            
            
                
        elif action == 2:  # เปิด Short
            if self.position > 0:  # มี Long 
                realized_profit = self.close_all_positions(current_price)
                if self.unrealized_long_pnl < 0 : 
                    reward += abs(self.unrealized_long_pnl) * 0.2 # cut loss
                    isCutloss = True
            if self.position > -5:  # เปิดเพิ่มได้สูงสุด -5 ตำแหน่ง
                self.position -= 1
                self.entry_prices.append(current_price)
                self.entry_indexs.append(self.index)
            if self.unrealized_short_pnl < 0 and not isCutloss:
                reward -= abs(self.unrealized_short_pnl) * 0.1 # opening new positions while already in a losing position
            
           
       
        reward += realized_profit
        
        
      

        if (action == 1 and self.data.iloc[self.index]['trend_7'] == 1) or (action == 2 and self.data.iloc[self.index]['trend_7'] == -1):
            reward += abs(self.capital/5) * 0.002 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['trend_21'] == 1) or (action == 2 and self.data.iloc[self.index]['trend_21'] == -1):
            reward += abs(self.capital/5) * 0.003 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['trend_89'] == 1) or (action == 2 and self.data.iloc[self.index]['trend_89'] == -1):
            reward += abs(self.capital/5) * 0.004 # Small bonus for following the tren
        if (action == 1 and self.data.iloc[self.index]['trend_200'] == 1) or (action == 2 and self.data.iloc[self.index]['trend_200'] == -1):
            reward += abs(self.capital/5) * 0.005 # Small bonus for following the trend
   

        if (action == 1 and self.data.iloc[self.index]['close_minus_ema7'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_ema7'] < 0):
            reward += abs(self.capital/5) * 0.002 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['close_minus_ema21'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_ema21'] < 0):
            reward += abs(self.capital/5) * 0.003 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['close_minus_ema89'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_ema89'] < 0):
            reward += abs(self.capital/5) * 0.004 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['close_minus_ema200'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_ema200'] < 0):
            reward += abs(self.capital/5) * 0.005 # Small bonus for following the trend
      
        
        if (action == 1 and self.data.iloc[self.index]['close_minus_trendline_7'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_trendline_7'] < 0):
            reward += abs(self.capital/5) * 0.002 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['close_minus_trendline_21'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_trendline_21'] < 0):
            reward += abs(self.capital/5) * 0.003 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['close_minus_trendline_89'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_trendline_89'] < 0):
            reward += abs(self.capital/5) * 0.004 # Small bonus for following the trend
        if (action == 1 and self.data.iloc[self.index]['close_minus_trendline_200'] > 0 ) or (action == 2 and self.data.iloc[self.index]['close_minus_trendline_200'] < 0):
            reward += abs(self.capital/5) * 0.005 # Small bonus for following the trend
     

        
       

        self.index += 1  # ขยับไปยังข้อมูลถัดไป 

        return self.get_state(), reward ,realized_profit

    def close_all_positions(self, current_price):
        """ ปิดสถานะทั้งหมด และคำนวณกำไร/ขาดทุน """
        profit = 0

        for entry_price in self.entry_prices:
            trade_profit = (current_price - entry_price) if self.position > 0 else (entry_price - current_price)
            profit += trade_profit * ((self.capital / 5) / entry_price) 

            
        self.capital += profit
        
       
        # รีเซ็ตสถานะ
        self.position = 0
        self.entry_prices = []
        return profit


# Fitness evaluation function
def evaluate_genome(genome, config ):
    net = neat.nn.FeedForwardNetwork.create(genome, config )
    #  data[400:1350]
    train_data = data[21:]
    env = TradingEnvironment(train_data)
    total_profit = 0
    total_reward = 0
    actions_log = []
    long_trades = 0
    short_trades = 0


    
    for _ in range(len(train_data)-10):
        state = env.get_state()
        if state is None:
            break
        
        
        action = np.argmax(net.activate(state))

        if random.random() < 0.1:  # 10% chance to explore
            action = random.choice([0, 1, 2])

        _, reward,profit = env.step(action)

        total_reward += reward
        total_profit += profit
       
        if action == 1:  # Long trades
            long_trades += 1
        elif action == 2:  # Short trades
            short_trades += 1
        

       
        actions_log.append({
            "index": env.index ,
            "state": state,
            "action": action,
            "reward": reward,
            "profit": profit,
            "capital": env.capital,
            'close': env.data.iloc[env.index]['close']
        })
    

    

    genome.fitness = total_reward 
    return total_reward, total_profit, actions_log



# Fitness function wrapper for NEAT
def fitness_function(genomes, config):
    global_action_counts = {"long": 0, "short": 0, "hold": 0}

    for genome_id, genome in genomes:
        total_reward, total_profit, actions_log = evaluate_genome(genome, config  )

        # Count actions from the genome's logs
        for log_entry in actions_log: 
            action = log_entry["action"]
            if action == 1:  
                global_action_counts["long"] += 1
            elif action == 2:  
                global_action_counts["short"] += 1
            elif action == 0:  # Hold action
                global_action_counts["hold"] += 1
    # Print action counts for this generation
    print(f"\nGeneration Action Counts:\n{global_action_counts}\n")


# NEAT configuration
def run_neat(config_file):
    config = neat.Config(neat.DefaultGenome, neat.DefaultReproduction,
                         neat.DefaultSpeciesSet, neat.DefaultStagnation,
                         config_file)

    population = neat.Population(config)
    population.add_reporter(neat.StdOutReporter(True))
    stats = neat.StatisticsReporter()
    population.add_reporter(stats)

    # Run NEAT for 20 generations
    winner = population.run(fitness_function, 20)

    # Log the best genome's performance
    reward, profit, actions_log = evaluate_genome(winner, config )
    for log_entry in actions_log:
        log_line = (
            f"Step {log_entry['index']}:\n"
            f"State: {log_entry['state']}\n"
            f"Action: {log_entry['action']}\n"
            f"Reward: {log_entry['reward']:.2f}\n"
            f"Profit: {log_entry['profit']:.2f}\n"
            f"Capital: {log_entry['capital']:.2f}\n"
            f"Close: {log_entry['close']:.2f}\n"
        )
        print(log_line)


    bestgenome_action_counts = {"long": 0, "short": 0, "hold": 0}
     # Count actions from the genome's logs
    for log_entry in actions_log:
        action = log_entry["action"]
        if action == 1 :  # Long actions (1 = open, 2 = close)
            bestgenome_action_counts["long"] += 1
        elif action == 2:  # Short actions (3 = open, 4 = close)
            bestgenome_action_counts["short"] += 1
        elif action == 0:  # Hold action
            bestgenome_action_counts["hold"] += 1
    
    print(f"\nBestgenome Action Counts:\n{bestgenome_action_counts}\n")

    # Save the best genome
    with open("v10_USDJPY_D1_ALL_2011-2023.pkl", "wb") as f:
        pickle.dump(winner, f)

    print("\nBest genome:\n", winner)
    print("\nProfit:\n", profit)
    print("\nFitness:\n", reward)



# Main entry point
if __name__ == "__main__":
    # NEAT config file path
    config_path = "neat-config-2.txt"
    run_neat(config_path)
