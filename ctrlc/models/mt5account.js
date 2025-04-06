import mongoose, { Schema } from "mongoose";

const mt5_accountSchema = new Schema(
    {
        mt5_id:{
            type: String,
            required: true
        },
        mt5_name: {
            type: String,
            required: true 
        },
        token: {
            type: String,
            required: false,
        },
        account_type: {
            type: String,
            required: true,
        },
        status:{
            type:String
        }
    },
    { timestamps: true }
)

const Mt5_account = mongoose.models.Mt5_account || mongoose.model("Mt5_account", mt5_accountSchema);
export default Mt5_account;