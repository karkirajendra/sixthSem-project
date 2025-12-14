import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
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
      <h1>Password Reset Request</h1>
      <p>Dear ${name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="color: #007bff;">Reset Password</a></p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Password reset link: ${resetUrl}`,
  }),
};
