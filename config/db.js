import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  let connectionString;
  console.log('NODE_ENV==>', process.env.NODE_ENV);
  try {
      (connectionString = process.env.MONGO_URI); 
    const { connection } = await mongoose.connect(connectionString);
    console.log(`MongoDB connected with ${connection.host}`);
  } catch (error) {
    console.log('ERROR CONNECTING DB',error);
  }
};
