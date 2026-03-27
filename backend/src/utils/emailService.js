import nodemailer from 'nodemailer';

// Create reusable transporter object using Mailtrap SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT) || 2525,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  // Log SMTP config (without password) for debugging
  console.log('Email config:', {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USERNAME,
    from: process.env.MAIL_FROM_ADDRESS,
  });

  // Verify connection first
  await transporter.verify();

  const message = {
    from: `${process.env.MAIL_FROM_NAME || 'RoomSathi'} <${process.env.MAIL_FROM_ADDRESS}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
  return info;
};

// Email templates
export const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to RoomSathi',
    html: `
      <h1>Welcome to RoomSathi, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to help you find your perfect home.</p>
      <p>Start exploring our properties and find your ideal place today!</p>
      <p>Best regards,<br>The RoomSathi Team</p>
    `,
    text: `Welcome to RoomSathi, ${name}! Thank you for joining our platform.`,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request - RoomSathi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #3b82f6, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6b7280;">We received a request to reset your RoomSathi password. Click the button below to set a new one:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6, #14b8a6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">This link expires in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© RoomSathi — Find Your Perfect Living Space</p>
        </div>
      </div>
    `,
    text: `Hi ${name}, reset your password here: ${resetUrl} (expires in 10 minutes)`,
  }),
};
