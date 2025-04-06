import mongoose, { Schema } from "mongoose";

const strategieSchema = new Schema(
    {
        _id : {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String,
            required: true
        },
        timeframe: {
            type: String,
            required: true
        },
        commission: {
            type: Number,
            required: true
        },
        symbol: {
            type: String,
            required: false,
        },
        traders: { type: Number, default: 0 }




    },
    { timestamps: true }
)

const Strategie = mongoose.models.Strategie || mongoose.model("Strategie", strategieSchema);
export default Strategie;