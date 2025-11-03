const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration not found. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
  }

  // For development, you can use Gmail or any SMTP service
  // Make sure to set these environment variables in your .env file
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
  });
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL NOT CONFIGURED - DEVELOPMENT MODE');
      console.log('='.repeat(60));
      console.log(`📬 OTP for ${email}: ${otp}`);
      console.log('⏰ This OTP will expire in 10 minutes');
      console.log('='.repeat(60));
      console.log('To enable real email sending, add to your .env file:');
      console.log('EMAIL_USER=your_email@gmail.com');
      console.log('EMAIL_PASSWORD=your_app_password');
      console.log('='.repeat(60) + '\n');
      
      return { success: true, messageId: 'console-log', developmentMode: true };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              You requested to reset your password. Please use the following OTP to verify your identity:
            </p>
            <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This OTP will expire in 10 minutes. If you didn't request this password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
