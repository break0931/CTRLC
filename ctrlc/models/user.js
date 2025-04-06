import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: false
        },
        role: {
            type: String,
            required: false,
            default: "user"
        },
        isOnboard: {
            type: Boolean,
            default:false
        },
        stripe_account : {
            type: String,
            default:null
        }
       
    },
    { timestamps: true }
)

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;