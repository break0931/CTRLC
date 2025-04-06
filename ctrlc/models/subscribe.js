import mongoose, { Schema } from "mongoose";

const subscribeSchema = new Schema(
    {
        strategie_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Strategie",
            required: true
        },
        mt5_id: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        start_date:{
            type: Date,
            default:Date.now
        },
        end_date:{
            type: Date,
            required : false
        }
      

    },
    { timestamps: true }
)

const Subscribe = mongoose.models.Subscribe || mongoose.model("Subscribe", subscribeSchema);
export default Subscribe;