import zmq
import json
import pandas as pd
import numpy as np
import neat
import pickle

def main():
    np.set_printoptions(suppress=True, precision=6)

    # Load the trained model
    with open('v10_add_all_trend_reducecutloss_split_unrealized_config-2_fix_rewardstructure_H4_ALL_2011-2023.pkl', 'rb') as f:
        winner_genome = pickle.load(f)


    # Load NEAT configuration
    config_path = "neat-config-2.txt"
    config = neat.Config(neat.DefaultGenome, neat.DefaultReproduction,
                         neat.DefaultSpeciesSet, neat.DefaultStagnation,
                         config_path)
    winner_net = neat.nn.FeedForwardNetwork.create(winner_genome, config)


    # Load normalization parameters
    with open("normalization_params_H4.pkl", "rb") as f:
        norm_params = pickle.load(f)

    # Set up ZMQ communication
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://*:5555")

    
    print("Python Server: Waiting for messages...")
    
    # Initialize DataFrame
    df = pd.DataFrame(columns=["Close", "close_minus_trendline", "Volume", "Position", 
                              "trendline", "price_diff"]).astype({
        "Close": "float",
        "close_minus_trendline": "float",
        "Volume": "int",
        "Position": "int",
        "trendline": "float",
        "price_diff": "float"
    })

  
    def calculate_trendline(data):
        x = np.array(range(len(data)))
        y = data['Close'].values
        coefficients = np.polyfit(x, y, 1)
        return coefficients[0], coefficients[1], x

    def normalize_features(features):
        """
        Apply normalization to input features using saved parameters
        """
        normalized = []
        
        # Normalize each feature using the corresponding parameters
        # Keep the original order of features!
        feature_names = [   
                            "close_minus_trendline_7", "close_minus_ema7",  "trend_7" , 
                            "close_minus_trendline_21", "close_minus_ema21",  "trend_21" , 
                            "close_minus_trendline_89", "close_minus_ema89",  "trend_89" ,
                            "close_minus_trendline_200", "close_minus_ema200",  "trend_200" ,
                            "price_diff", "Volume", 
                            "num_long", "num_short",
                            "unrealized_long" , "unrealized_short"    
                        ]
        
        for i, feature_name in enumerate(feature_names):
            # Skip normalizing categorical features like trend (which is -1 or 1)
            if feature_name == "trend_7":
                normalized.append(features[i])
                continue
            if feature_name == "trend_21":
                normalized.append(features[i])
                continue
            if feature_name == "trend_89":
                normalized.append(features[i])
                continue
            if feature_name == "trend_200":
                normalized.append(features[i])
                continue

            
            # Skip normalizing position indicators if you want to keep them as is
            if feature_name in ["num_long", "num_short"]:
                normalized.append(features[i])
                continue
            # Skip normalizing position indicators if you want to keep them as is
            if feature_name == "unrealized":
                normalized.append(features[i])
                continue
            if feature_name == "unrealized_long":
                normalized.append(features[i])
                continue  
            if feature_name == "unrealized_short":
                normalized.append(features[i])
                continue      

            # Apply z-score normalization: (x - mean) / std
            mean = norm_params[f"mean_{feature_name}"]
            std = norm_params[f"std_{feature_name}"]
            
            # Avoid division by zero
            if std == 0:
                normalized.append(0)
            else:
                normalized.append((features[i] - mean) / std)
                
        return normalized

    while True:
        message = socket.recv()
        message_str = message.decode()
        print(message_str)
        
        try:
            # Load JSON data
            data_list = json.loads(message_str)
            new_rows = pd.DataFrame(data_list)

            # Ensure numeric types
            new_rows = new_rows.astype({
                "Close": "float",
                "Volume": "int",
                "Position": "int",
                "unrealized" : "float",
                "unrealized_long":"float",
                "unrealized_short":"float"
            })
            
            # Create num_short and num_long columns
            new_rows["num_short"] = new_rows["Position"].apply(lambda x: abs(x) if x < 0 else 0)
            new_rows["num_long"] = new_rows["Position"].apply(lambda x: x if x > 0 else 0)

          
            # Drop the original Position column
            new_rows.drop(columns=["Position"], inplace=True)
            
            # Drop datetime column if it exists
            if 'datetime' in new_rows.columns:
                new_rows.drop(columns=['datetime'], inplace=True)

            # Append new data to df and keep only the last 200 rows
            df = pd.concat([df, new_rows], ignore_index=True).tail(200)


            window_size = 200
            # Calculate trendline if we have enough data
            if len(df) >= window_size:
                slope, intercept, x = calculate_trendline(df.iloc[-window_size:])
                df.loc[df.index[-1], 'trendline_200'] = slope * x[-1] + intercept
               
            window_size = 89
            # Calculate trendline if we have enough data
            if len(df) >= window_size:
                slope, intercept, x = calculate_trendline(df.iloc[-window_size:])
                df.loc[df.index[-1], 'trendline_89'] = slope * x[-1] + intercept
                
            window_size = 21
            # Calculate trendline if we have enough data
            if len(df) >= window_size:
                slope, intercept, x = calculate_trendline(df.iloc[-window_size:])
                df.loc[df.index[-1], 'trendline_21'] = slope * x[-1] + intercept

            window_size = 7
            # Calculate trendline if we have enough data
            if len(df) >= window_size:
                slope, intercept, x = calculate_trendline(df.iloc[-window_size:])
                df.loc[df.index[-1], 'trendline_7'] = slope * x[-1] + intercept
            
            # Calculate trend direction
            df['trend_200'] = np.where(df['trendline_200'].diff().fillna(0) > 0, 1, -1)
            df['trend_89'] = np.where(df['trendline_89'].diff().fillna(0) > 0, 1, -1)
            df['trend_21'] = np.where(df['trendline_21'].diff().fillna(0) > 0, 1, -1)
            df['trend_7'] = np.where(df['trendline_7'].diff().fillna(0) > 0, 1, -1)
            
            # Calculate EMA
            df['ema_200'] = df['Close'].ewm(span=200, adjust=False).mean()
            df['ema_89'] = df['Close'].ewm(span=89, adjust=False).mean()
            df['ema_21'] = df['Close'].ewm(span=21, adjust=False).mean()
            df['ema_7'] = df['Close'].ewm(span=7, adjust=False).mean()

            # Calculate price difference and technical indicators
            df["price_diff"] = df["Close"].diff()
            df["close_minus_trendline_200"] = df["Close"] - df["trendline_200"]
            df["close_minus_trendline_89"] = df["Close"] - df["trendline_89"]
            df["close_minus_trendline_21"] = df["Close"] - df["trendline_21"]
            df["close_minus_trendline_7"] = df["Close"] - df["trendline_7"]


            df["close_minus_ema200"] = df["Close"] - df["ema_200"]
            df["close_minus_ema89"] = df["Close"] - df["ema_89"]
            df["close_minus_ema21"] = df["Close"] - df["ema_21"]
            df["close_minus_ema7"] = df["Close"] - df["ema_7"]
            # Fill NaN values
            df.fillna(0, inplace=True)

        except json.JSONDecodeError:
            print("Error: Invalid JSON format")
            socket.send_string("-1")  # Send error code
            continue
        except KeyError as e:
            print(f"KeyError: {e}")
            socket.send_string("-1")  # Send error code
            continue

        # Get the latest row for prediction
        latest_features = df.tail(1)[[ 

                                    "close_minus_trendline_7", "close_minus_ema7",  "trend_7" , 
                                    "close_minus_trendline_21", "close_minus_ema21",  "trend_21" , 
                                    "close_minus_trendline_89", "close_minus_ema89",  "trend_89" ,
                                    "close_minus_trendline_200", "close_minus_ema200",  "trend_200" ,
                                    "price_diff", "Volume", 
                                    "num_long", "num_short",
                                    "unrealized_long" , "unrealized_short"       
                                    
                                    ]].values.flatten()
        latest_features = latest_features.astype(float)
        
        print("Raw features:", latest_features)
        
        # Apply normalization
        normalized_features = normalize_features(latest_features)
        print("Normalized features:", normalized_features)
        
        # Make prediction using normalized features
        raw_output = winner_net.activate(normalized_features)
        print("Model outputs:", raw_output)
        
        action = np.argmax(raw_output)
        print("Predicted action:", action)
        
        # Send back the predicted action
        socket.send_string(str(action))

if __name__ == "__main__":
    main()