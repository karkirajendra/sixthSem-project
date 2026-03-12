import mongoose from 'mongoose';
import Feedback from './src/models/Feedback.js';
import dotenv from 'dotenv';

dotenv.config();

const seedFeedback = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear all feedback — no seed data
    await Feedback.deleteMany({});
    console.log('✓ All feedback cleared');

    console.log('Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing feedback:', error);
    process.exit(1);
  }
};

seedFeedback();
