import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema(
    {
        token:{
            type: String,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
)

const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);
export default Token;