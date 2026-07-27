import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI chưa được cấu hình');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}
