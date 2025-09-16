import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError';

// Email templates
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use real SMTP (e.g., SendGrid, AWS SES, etc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development: Use Ethereal (fake SMTP)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
      }
    });
  }
};

const transporter = createTransporter();

// Base email function
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Home Service Platform'}" <${process.env.FROM_EMAIL || 'noreply@homeservice.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email sent:', info.messageId);
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    throw new ApiError(500, 'Failed to send email');
  }
};

// Email verification template
const getVerificationEmailTemplate = (firstName: string, verificationToken: string, to?: string): EmailTemplate => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
  
  return {
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏠 Home Service Platform</div>
          <p>Welcome to our community!</p>
        </div>
        <div class="content">
          <h2>Hi ${firstName}! 👋</h2>
          <p>Thank you for registering with Home Service Platform. To complete your registration and start using our services, please verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p><strong>Or copy and paste this link:</strong></p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours for security reasons.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <h3>What's Next? 🚀</h3>
          <ul>
            <li>✅ Verify your email (you're doing this now!)</li>
            <li>🏠 Complete your profile</li>
            <li>🔍 Start browsing amazing services</li>
            <li>⭐ Book your first appointment</li>
          </ul>
          
          <p>If you didn't create this account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
          <p>This email was sent to ${to || 'you'}</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${firstName}!
      
      Welcome to Home Service Platform! 
      
      Please verify your email address by clicking this link: ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create this account, you can safely ignore this email.
      
      © ${new Date().getFullYear()} Home Service Platform
    `
  };
};

// Welcome email template
const getWelcomeEmailTemplate = (firstName: string, role: string, to?: string): EmailTemplate => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${role}/dashboard`;
  
  const roleSpecificContent = {
    customer: {
      title: 'Welcome to Your New Home Service Experience! 🎉',
      benefits: [
        '🔍 Browse thousands of verified service providers',
        '⚡ Book services instantly or schedule for later',
        '💰 Earn loyalty coins with every booking',
        '⭐ Read real reviews from other customers',
        '📱 Manage everything from your mobile device'
      ],
      cta: 'Start Exploring Services'
    },
    provider: {
      title: 'Welcome to the Provider Community! 💼',
      benefits: [
        '📈 Grow your business with new customers',
        '💳 Get paid quickly and securely',
        '📊 Track your performance with analytics',
        '⭐ Build your reputation with reviews',
        '🎯 Use marketing tools to attract clients'
      ],
      cta: 'Complete Your Profile'
    },
    admin: {
      title: 'Welcome to the Admin Panel! 🛠️',
      benefits: [
        '👥 Manage users and providers',
        '📊 Monitor platform analytics',
        '🔧 Configure platform settings',
        '🛡️ Ensure platform security',
        '📈 Drive platform growth'
      ],
      cta: 'Access Admin Dashboard'
    }
  };

  const content = roleSpecificContent[role as keyof typeof roleSpecificContent] || roleSpecificContent.customer;

  return {
    subject: `${content.title}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Home Service Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 25px 0; }
          .benefits { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .logo { font-size: 28px; font-weight: bold; }
          ul { padding-left: 0; }
          li { list-style: none; padding: 8px 0; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏠 Home Service Platform</div>
          <h1>${content.title}</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName}! 🎉</h2>
          <p>Your email has been verified and your account is now active! We're thrilled to have you join our community.</p>
          
          <div class="benefits">
            <h3>Here's what you can do now:</h3>
            <ul>
              ${content.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">${content.cta}</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <h3>Need Help? 🤝</h3>
          <p>Our support team is here to help you get started:</p>
          <ul>
            <li>📧 Email: support@homeservice.com</li>
            <li>💬 Live chat on our website</li>
            <li>📞 Phone: 1-800-HOME-SVC</li>
            <li>📱 Download our mobile app for iOS and Android</li>
          </ul>
          
          <p>Welcome aboard! We can't wait to see what amazing experiences await you.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
          <p>This email was sent to ${to || 'you'}</p>
        </div>
      </body>
      </html>
    `
  };
};

// Password reset email template
const getPasswordResetEmailTemplate = (firstName: string, resetToken: string, to?: string): EmailTemplate => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  return {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>We received a request to reset your password for your Home Service Platform account.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p><strong>Or copy and paste this link:</strong></p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password remains unchanged until you create a new one</li>
            </ul>
          </div>
          
          <p>For your security, we recommend choosing a strong password that includes:</p>
          <ul>
            <li>At least 8 characters</li>
            <li>One uppercase and one lowercase letter</li>
            <li>At least one number</li>
            <li>At least one special character (@$!%*?&)</li>
          </ul>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
          <p>This email was sent to ${to || 'you'}</p>
        </div>
      </body>
      </html>
    `
  };
};

// Public email service functions
export const sendVerificationEmail = async (
  email: string, 
  firstName: string, 
  verificationToken: string
): Promise<void> => {
  const template = getVerificationEmailTemplate(firstName, verificationToken, email);
  await sendEmail(email, template.subject, template.html, template.text);
};

export const sendWelcomeEmail = async (
  email: string, 
  firstName: string, 
  role: string
): Promise<void> => {
  const template = getWelcomeEmailTemplate(firstName, role, email);
  await sendEmail(email, template.subject, template.html);
};

export const sendPasswordResetEmail = async (
  email: string, 
  firstName: string, 
  resetToken: string
): Promise<void> => {
  const template = getPasswordResetEmailTemplate(firstName, resetToken, email);
  await sendEmail(email, template.subject, template.html);
};

// Booking confirmation email
export const sendBookingConfirmationEmail = async (
  email: string,
  firstName: string,
  bookingDetails: any
): Promise<void> => {
  const subject = `Booking Confirmed - ${bookingDetails.serviceName}`;
  const html = `
    <h2>Hi ${firstName}!</h2>
    <p>Your booking has been confirmed.</p>
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Booking Details:</h3>
      <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
      <p><strong>Provider:</strong> ${bookingDetails.providerName}</p>
      <p><strong>Date & Time:</strong> ${bookingDetails.dateTime}</p>
      <p><strong>Duration:</strong> ${bookingDetails.duration} minutes</p>
      <p><strong>Total Cost:</strong> $${bookingDetails.totalCost}</p>
    </div>
    <p>We'll send you a reminder 24 hours before your appointment.</p>
  `;
  
  await sendEmail(email, subject, html);
};

// Loyalty points notification
export const sendLoyaltyPointsEmail = async (
  email: string,
  firstName: string,
  pointsEarned: number,
  totalPoints: number,
  reason: string
): Promise<void> => {
  const subject = `You earned ${pointsEarned} loyalty coins! 🪙`;
  const html = `
    <h2>Congratulations ${firstName}! 🎉</h2>
    <p>You just earned <strong>${pointsEarned} loyalty coins</strong> for: ${reason}</p>
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3>Your Loyalty Balance</h3>
      <p style="font-size: 24px; color: #667eea;"><strong>${totalPoints} coins</strong></p>
    </div>
    <p>Use your coins to get discounts on future bookings!</p>
  `;
  
  await sendEmail(email, subject, html);
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendLoyaltyPointsEmail
};