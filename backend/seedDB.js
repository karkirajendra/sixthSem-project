import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/user.js';
import Property from './src/models/Property.js';
import { CmsPage, BlogPost } from './src/models/CmsPage.js';
import connectDB from './src/config/database.js';

dotenv.config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@roomsathi.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    verification: {
      isEmailVerified: true,
    },
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'buyer',
    status: 'active',
    profile: {
      phone: '+977-9841234567',
      address: {
        city: 'Kathmandu',
        state: 'Province 3',
      },
    },
    verification: {
      isEmailVerified: true,
    },
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'seller',
    status: 'active',
    profile: {
      phone: '+977-9851234567',
      address: {
        city: 'Lalitpur',
        state: 'Province 3',
      },
    },
    verification: {
      isEmailVerified: true,
    },
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'seller',
    status: 'active',
    profile: {
      phone: '+977-9861234567',
      address: {
        city: 'Bhaktapur',
        state: 'Province 3',
      },
    },
    verification: {
      isEmailVerified: true,
    },
  },
];

const properties = [
  {
    title: 'Modern Single Room with Kitchen',
    description:
      'A beautifully designed single room with attached kitchen and sleeping area. Perfect for students and young professionals.',
    type: 'room',
    roomType: 'single-kitchen',
    price: 8000,
    location: 'Kathmandu',
    area: 200,
    features: {
      electricity: true,
      wifi: true,
      security: true,
      furnished: true,
    },
    images: [
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
    ],
    status: 'available',
    featured: true,
  },
  {
    title: 'Cozy Double Room',
    description:
      'Spacious double room with shared kitchen and bathroom facilities. Great for couples or friends.',
    type: 'room',
    roomType: 'double',
    price: 12000,
    location: 'Patan',
    area: 250,
    features: {
      electricity: true,
      parking: true,
      security: true,
    },
    images: [
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    ],
    status: 'available',
    featured: false,
  },
  {
    title: 'Luxury Studio Apartment',
    description:
      'Fully furnished studio apartment with modern amenities and great city views.',
    type: 'room',
    roomType: 'studio',
    price: 18000,
    location: 'Boudha',
    area: 300,
    features: {
      electricity: true,
      wifi: true,
      security: true,
      furnished: true,
      waterSupply: true,
    },
    images: [
      'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg',
    ],
    status: 'available',
    featured: true,
  },
  {
    title: 'Spacious 2BHK Flat',
    description:
      'Modern 2BHK flat with all amenities in a prime location. Perfect for families.',
    type: 'flat',
    flatType: '2bhk',
    price: 25000,
    location: 'Lalitpur',
    area: 800,
    bedrooms: 2,
    bathrooms: 2,
    features: {
      electricity: true,
      parking: true,
      wifi: true,
      security: true,
      furnished: true,
      waterSupply: true,
    },
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    ],
    status: 'available',
    featured: true,
  },
  {
    title: 'Luxury 3BHK Apartment',
    description:
      'Premium apartment with modern amenities and stunning city views. High-end living experience.',
    type: 'flat',
    flatType: '3bhk',
    price: 35000,
    location: 'Kathmandu',
    area: 1200,
    bedrooms: 3,
    bathrooms: 3,
    features: {
      electricity: true,
      parking: true,
      wifi: true,
      security: true,
      furnished: true,
      waterSupply: true,
    },
    images: [
      'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg',
    ],
    status: 'available',
    featured: true,
  },
];

const cmsPages = [
  {
    title: 'About Us',
    slug: 'about',
    content: `
      <h1>About RoomSathi</h1>
      <p>Welcome to RoomSathi, Nepal's premier platform for finding rooms, flats, and apartments.</p>
      <p>Our mission is to make property rental simple, efficient, and stress-free for everyone.</p>
    `,
    type: 'about',
    status: 'published',
    publishedAt: new Date(),
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    content: `
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information.</p>
    `,
    type: 'privacy',
    status: 'published',
    publishedAt: new Date(),
  },
  {
    title: 'Terms and Conditions',
    slug: 'terms',
    content: `
      <h1>Terms and Conditions</h1>
      <p>By using our platform, you agree to these terms and conditions.</p>
    `,
    type: 'terms',
    status: 'published',
    publishedAt: new Date(),
  },
];

const blogPosts = [
  {
    title: 'Complete Guide to Renting in Kathmandu',
    slug: 'complete-guide-renting-kathmandu',
    content: `
      <p>Finding a rental property in Kathmandu can be challenging. Here's your complete guide to make the process easier.</p>
      <h2>1. Know Your Budget</h2>
      <p>Before starting your search, determine how much you can afford to spend on rent monthly.</p>
      <h2>2. Choose the Right Location</h2>
      <p>Consider factors like commute time, amenities, and neighborhood safety.</p>
    `,
    excerpt:
      'Your comprehensive guide to finding and renting properties in Kathmandu valley.',
    category: 'Guide',
    tags: ['kathmandu', 'rental', 'guide', 'tips'],
    author: {
      name: 'RoomSathi Team',
      email: 'team@roomsathi.com',
    },
    status: 'published',
    publishedAt: new Date(),
    featuredImage:
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
  },
  {
    title: '10 Things to Check Before Renting a Room',
    slug: '10-things-check-before-renting-room',
    content: `
      <p>Renting a room is a big decision. Here are 10 essential things you should check before signing any agreement.</p>
      <ol>
        <li>Water and electricity supply</li>
        <li>Internet connectivity</li>
        <li>Security arrangements</li>
        <li>Ventilation and natural light</li>
        <li>Nearby amenities</li>
      </ol>
    `,
    excerpt: 'Essential checklist for anyone looking to rent a room in Nepal.',
    category: 'Tips',
    tags: ['rental', 'checklist', 'tips'],
    author: {
      name: 'Property Expert',
      email: 'expert@roomsathicom',
    },
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    featuredImage:
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await CmsPage.deleteMany({});
    await BlogPost.deleteMany({});

    // Note: Passwords will be hashed by the User model's pre-save hook
    // No need to hash them here to avoid double hashing

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Assign sellers to properties
    const sellers = createdUsers.filter((user) => user.role === 'seller');
    const admin = createdUsers.find((user) => user.role === 'admin');

    properties.forEach((property, index) => {
      property.sellerId = sellers[index % sellers.length]._id;
    });

    // Create properties
    console.log('Creating properties...');
    const createdProperties = await Property.create(properties);
    console.log(`Created ${createdProperties.length} properties`);

    // Assign admin as author for CMS pages
    cmsPages.forEach((page) => {
      page.author = admin._id;
    });

    // Create CMS pages
    console.log('Creating CMS pages...');
    const createdPages = await CmsPage.create(cmsPages);
    console.log(`Created ${createdPages.length} CMS pages`);

    // Create blog posts
    console.log('Creating blog posts...');
    const createdPosts = await BlogPost.create(blogPosts);
    console.log(`Created ${createdPosts.length} blog posts`);

    console.log('Database seeded successfully!');
    console.log('\nSample accounts:');
    console.log('Admin: admin@roomsathi.com / admin123');
    console.log('Buyer: john@example.com / password123');
    console.log('Seller: jane@example.com / password123');
    console.log('Seller: mike@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
