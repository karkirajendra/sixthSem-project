import mongoose from 'mongoose';
import Feedback from './src/models/Feedback.js';
import User from './src/models/user.js';
import Property from './src/models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

const seedFeedback = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing feedback
    await Feedback.deleteMany({});
    console.log('Cleared existing feedback');

    // Get a sample user (create one if none exists)
    let user = await User.findOne({ role: 'buyer' });
    if (!user) {
      user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'buyer',
      });
      console.log('Created sample user');
    }

    // Get a sample property (create one if none exists)
    let property = await Property.findOne();
    if (!property) {
      property = await Property.create({
        title: 'Beautiful Apartment in Kathmandu',
        description: 'A lovely 2-bedroom apartment with mountain views',
        type: 'apartment',
        location: 'Kathmandu, Nepal',
        price: 25000,
        sellerId: user._id,
        images: ['https://example.com/image1.jpg'],
        contact: {
          phone: '9841234567',
          email: 'owner@example.com',
        },
      });
      console.log('Created sample property');
    }

    // Sample feedback data
    const feedbackData = [
      {
        user: user._id,
        property: property._id,
        type: 'property_review',
        subject: 'Excellent Property!',
        message:
          'Found my dream apartment through RoomSathi. The platform is very user-friendly and the property details were accurate.',
        rating: 5,
        status: 'resolved',
        featured: true,
        showOnFrontend: true,
        priority: 'high',
      },
      {
        user: user._id,
        type: 'platform_feedback',
        subject: 'Great Service',
        message:
          'The booking process was smooth and customer support was very helpful. Highly recommend this platform!',
        rating: 5,
        status: 'resolved',
        featured: true,
        showOnFrontend: true,
        priority: 'medium',
      },
      {
        user: user._id,
        type: 'platform_feedback',
        subject: 'Room for Improvement',
        message:
          'The search filters could be improved. It would be nice to have more specific location filters.',
        rating: 4,
        status: 'pending',
        featured: false,
        showOnFrontend: false,
        priority: 'low',
      },
      {
        user: user._id,
        type: 'suggestion',
        subject: 'Mobile App Suggestion',
        message:
          'Please consider developing a mobile app for easier property browsing on the go.',
        rating: 4,
        status: 'reviewed',
        featured: false,
        showOnFrontend: false,
        priority: 'medium',
      },
      {
        user: user._id,
        property: property._id,
        type: 'property_review',
        subject: 'Average Experience',
        message:
          'The property was okay but not as described in the listing. Photos were better than reality.',
        rating: 3,
        status: 'dismissed',
        featured: false,
        showOnFrontend: false,
        priority: 'low',
      },
      {
        user: user._id,
        type: 'platform_feedback',
        subject: 'Outstanding Platform',
        message:
          'Best property rental platform in Nepal! Fast, reliable, and trustworthy. Found my perfect home within a week.',
        rating: 5,
        status: 'resolved',
        featured: true,
        showOnFrontend: true,
        priority: 'high',
      },
      {
        user: user._id,
        type: 'bug_report',
        subject: 'Payment Gateway Issue',
        message:
          'Encountered an error during payment process. The transaction failed but amount was deducted.',
        rating: 2,
        status: 'pending',
        featured: false,
        showOnFrontend: false,
        priority: 'high',
      },
      {
        user: user._id,
        property: property._id,
        type: 'property_review',
        subject: 'Good Property with Minor Issues',
        message:
          'The apartment is nice but the internet connection could be better. Overall satisfied with the booking.',
        rating: 4,
        status: 'resolved',
        featured: false,
        showOnFrontend: true,
        priority: 'medium',
      },
    ];

    // Insert feedback data
    const createdFeedback = await Feedback.insertMany(feedbackData);
    console.log(`Created ${createdFeedback.length} feedback entries`);

    // Display created feedback
    createdFeedback.forEach((feedback, index) => {
      console.log(
        `${index + 1}. ${feedback.subject} - Status: ${
          feedback.status
        }, Featured: ${feedback.featured}, Frontend: ${feedback.showOnFrontend}`
      );
    });

    console.log('Feedback seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding feedback:', error);
    process.exit(1);
  }
};

seedFeedback();
