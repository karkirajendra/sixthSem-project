import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.js';
import Property from './src/models/Property.js';
import { CmsPage, BlogPost } from './src/models/CmsPage.js';
import Feedback from './src/models/Feedback.js';
import Contact from './src/models/Contact.js';
import Wishlist from './src/models/Wishlist.js';
import Report from './src/models/Report.js';
import ChatRoom from './src/models/ChatRoom.js';
import Message from './src/models/Message.js';
import connectDB from './src/config/database.js';

dotenv.config();

// Only admin user — no other seed data
const adminUser = {
  name: 'Admin User',
  email: 'admin@roomsathi.com',
  password: 'admin123',
  role: 'admin',
  status: 'active',
  verification: {
    isEmailVerified: true,
  },
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('==============================');
    console.log('  Resetting Database...       ');
    console.log('==============================\n');

    // Clear ALL collections for a clean slate
    console.log('Clearing all collections...');
    await Property.deleteMany({});
    console.log('  ✓ Properties cleared');

    await Feedback.deleteMany({});
    console.log('  ✓ Feedback cleared');

    await Contact.deleteMany({});
    console.log('  ✓ Contacts cleared');

    await Wishlist.deleteMany({});
    console.log('  ✓ Wishlists cleared');

    await Report.deleteMany({});
    console.log('  ✓ Reports cleared');

    await Message.deleteMany({});
    console.log('  ✓ Messages cleared');

    await ChatRoom.deleteMany({});
    console.log('  ✓ Chat rooms cleared');

    await CmsPage.deleteMany({});
    console.log('  ✓ CMS Pages cleared');

    await BlogPost.deleteMany({});
    console.log('  ✓ Blog Posts cleared');

    await User.deleteMany({});
    console.log('  ✓ All users cleared');

    // Create only the admin user
    console.log('\nCreating admin user...');
    const admin = await User.create(adminUser);
    console.log(`  ✓ Admin created: ${admin.email}`);

    console.log('\n==============================');
    console.log('  Database Reset Complete!    ');
    console.log('==============================');
    console.log('\nAdmin Login Credentials:');
    console.log('  Email   : admin@roomsathi.com');
    console.log('  Password: admin123');
    console.log('\nApp is ready for fresh testing!\n');

    process.exit(0);
  } catch (error) {
    console.error('\nError resetting database:', error);
    process.exit(1);
  }
};

seedDatabase();
