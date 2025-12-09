const nodemailer = require('nodemailer');
const config = require('../config');

// Create transporter
const createTransporter = () => {
  if (config.NODE_ENV === 'development') {
    // Use Ethereal for development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }
  
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
};

// Send email
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `CareerKart <${config.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (config.NODE_ENV === 'development') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Welcome email
  welcome: (name) => ({
    subject: 'Welcome to CareerKart! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to CareerKart!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining CareerKart! We're excited to help you find your dream job.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Complete your profile to stand out to employers</li>
              <li>Upload your resume</li>
              <li>Start exploring job opportunities</li>
            </ul>
            <a href="${config.FRONTEND_URL}/jobs" class="button">Explore Jobs</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CareerKart. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to CareerKart, ${name}! Start exploring jobs at ${config.FRONTEND_URL}/jobs`,
  }),
  
  // Email verification
  verifyEmail: (name, token) => ({
    subject: 'Verify your email - CareerKart',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .code { background: #eee; padding: 10px 20px; font-size: 24px; letter-spacing: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${config.FRONTEND_URL}/verify-email?token=${token}" class="button">Verify Email</a>
            <p>Or use this verification code:</p>
            <p class="code">${token.slice(0, 6).toUpperCase()}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name}, verify your email at ${config.FRONTEND_URL}/verify-email?token=${token}`,
  }),
  
  // Password reset
  resetPassword: (name, token) => ({
    subject: 'Reset your password - CareerKart',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${config.FRONTEND_URL}/reset-password?token=${token}" class="button">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name}, reset your password at ${config.FRONTEND_URL}/reset-password?token=${token}`,
  }),
  
  // Application received
  applicationReceived: (applicantName, jobTitle, companyName) => ({
    subject: `Application received for ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Submitted!</h1>
          </div>
          <div class="content">
            <h2>Hi ${applicantName},</h2>
            <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully!</p>
            <p>The employer will review your application and get back to you soon.</p>
            <a href="${config.FRONTEND_URL}/applications" class="button">View Applications</a>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${applicantName}, your application for ${jobTitle} at ${companyName} has been submitted.`,
  }),
  
  // Interview scheduled
  interviewScheduled: (name, jobTitle, companyName, date, time, type) => ({
    subject: `Interview scheduled for ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Interview Scheduled! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Great news! Your interview has been scheduled.</p>
            <div class="details">
              <p><strong>Position:</strong> ${jobTitle}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Type:</strong> ${type}</p>
            </div>
            <p>Good luck with your interview!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name}, your interview for ${jobTitle} at ${companyName} is scheduled for ${date} at ${time}.`,
  }),
};

// Send specific emails
const sendWelcomeEmail = async (email, name) => {
  const template = emailTemplates.welcome(name);
  return sendEmail({ to: email, ...template });
};

const sendVerificationEmail = async (email, name, token) => {
  const template = emailTemplates.verifyEmail(name, token);
  return sendEmail({ to: email, ...template });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const template = emailTemplates.resetPassword(name, token);
  return sendEmail({ to: email, ...template });
};

const sendApplicationReceivedEmail = async (email, applicantName, jobTitle, companyName) => {
  const template = emailTemplates.applicationReceived(applicantName, jobTitle, companyName);
  return sendEmail({ to: email, ...template });
};

const sendInterviewScheduledEmail = async (email, name, jobTitle, companyName, date, time, type) => {
  const template = emailTemplates.interviewScheduled(name, jobTitle, companyName, date, time, type);
  return sendEmail({ to: email, ...template });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationReceivedEmail,
  sendInterviewScheduledEmail,
};
