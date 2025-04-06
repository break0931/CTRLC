
import mongoose from 'mongoose'

export const connectMongoDB = async () => {
    try {
        console.log('MONGODB_URI:', process.env.MONGODB_URI);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

    } catch(error) {
        console.log("Error connecting to MongoDB: ", error);
    }
}