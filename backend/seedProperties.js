import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.js';
import Property from './src/models/Property.js';
import connectDB from './src/config/database.js';

// Load env vars
dotenv.config();

const seedProperties = async () => {
  try {
    await connectDB();

    console.log('====================================');
    console.log('  Seeding Properties and Users...   ');
    console.log('====================================\n');

    // 1. Create a dummy seller
    const sellerExists = await User.findOne({ email: 'seller@roomsathi.com' });
    let sellerId;

    if (!sellerExists) {
      console.log('Creating demo seller account...');
      const seller = await User.create({
        name: 'Demo Seller',
        email: 'seller@roomsathi.com',
        password: 'password123',
        role: 'seller',
        status: 'active',
        verification: { isEmailVerified: true },
      });
      sellerId = seller._id;
      console.log('  ✓ Seller created: seller@roomsathi.com');
    } else {
      sellerId = sellerExists._id;
      console.log('  ✓ Seller already exists.');
    }

    // 2. Sample Properties with Real Images
    const properties = [
      {
        title: 'Modern Single Room with Kitchen',
        description: 'A beautifully designed single room with attached kitchen and sleeping area. Perfect for students or working professionals.',
        type: 'room',
        roomType: 'single-kitchen',
        price: 8000,
        contactPhone: '9841234567',
        location: 'Kathmandu',
        area: 200,
        bedrooms: 1,
        bathrooms: 1,
        features: { electricity: true, parking: false, wifi: true, security: true, furnished: true, waterSupply: true },
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        sellerId: sellerId,
        status: 'available',
        featured: true,
      },
      {
        title: 'Spacious 2BHK Flat in Patan',
        description: 'Modern 2BHK flat with all amenities in a prime location. Close to supermarkets and public transport.',
        type: 'flat',
        flatType: '2bhk',
        price: 25000,
        contactPhone: '9841234568',
        location: 'Lalitpur',
        area: 800,
        bedrooms: 2,
        bathrooms: 1,
        features: { electricity: true, parking: true, wifi: false, security: true, furnished: false, waterSupply: true },
        images: ['https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
        sellerId: sellerId,
        status: 'available',
        featured: false,
      },
      {
        title: 'Luxury Studio Apartment',
        description: 'Fully furnished luxury studio apartment with great city views, premium furniture, and 24/7 security.',
        type: 'apartment',
        flatType: '1bhk',
        price: 35000,
        contactPhone: '9841234569',
        location: 'Boudha',
        area: 450,
        bedrooms: 1,
        bathrooms: 1,
        features: { electricity: true, parking: true, wifi: true, security: true, furnished: true, waterSupply: true },
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
        sellerId: sellerId,
        status: 'available',
        featured: true,
      }
    ];

    console.log('\nInserting properties...');
    const insertedProperties = await Property.insertMany(properties);
    console.log(`  ✓ Successfully inserted ${insertedProperties.length} properties!`);

    console.log('\n====================================');
    console.log('  Seeding Complete!                 ');
    console.log('====================================');
    console.log('\nSeller Login:');
    console.log('  Email   : seller@roomsathi.com');
    console.log('  Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('\nError seeding database:', error);
    process.exit(1);
  }
};

seedProperties();
