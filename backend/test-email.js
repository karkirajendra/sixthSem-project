import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 2525,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

console.log('Testing Mailtrap connection with config:');
console.log({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  user: process.env.MAIL_USERNAME,
  from: process.env.MAIL_FROM_ADDRESS,
});

async function test() {
  try {
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

test();
