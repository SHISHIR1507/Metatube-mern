//connecting with the db 
import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import express from 'express';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}` )
        console.log(`\n MongoDB connected successfully: DB Host:${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1);
        
    }
}
export default connectDB;