import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // To load environment variables from .env

// Set up the email transporter using SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use another email service (e.g., SendGrid, SES)
  auth: {
    user: process.env.EMAIL_USER, // Your email address (example: 'your-email@gmail.com')
    pass: process.env.EMAIL_PASS, // Your email password or App-specific password
  },
});

/**
 * Send a plain text email
 * 
 * @param {string} to - The recipient's email address
 * @param {string} subject - The email subject
 * @param {string} text - The body of the email (plain text)
 * @returns {Promise} - The email sending result
 */
export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // The sender's email
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send an HTML formatted email
 * 
 * @param {string} to - The recipient's email address
 * @param {string} subject - The email subject
 * @param {string} html - The body of the email (HTML format)
 * @returns {Promise} - The email sending result
 */
export const sendHtmlEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // The sender's email
    to,
    subject,
    html, // HTML formatted content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send a welcome email to a new user
 * 
 * @param {string} to - The recipient's email address
 * @param {string} userName - The user's name to personalize the email
 * @returns {Promise} - The email sending result
 */
export const sendWelcomeEmail = async (to, userName) => {
  const subject = 'Welcome to Our Service!';
  const htmlContent = `
    <h1>Hi ${userName},</h1>
    <p>Welcome to our service! We are excited to have you on board.</p>
    <p>If you have any questions, feel free to reach out to us.</p>
  `;
  return await sendHtmlEmail(to, subject, htmlContent);
};

/**
 * Send a password reset email
 * 
 * @param {string} to - The recipient's email address
 * @param {string} resetLink - The password reset link
 * @returns {Promise} - The email sending result
 */
export const sendPasswordResetEmail = async (to, resetLink) => {
  const subject = 'Password Reset Request';
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return await sendHtmlEmail(to, subject, htmlContent);
};

/**
 * Send an email notification
 * 
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject of the notification
 * @param {string} notificationMessage - The content of the notification
 * @returns {Promise} - The email sending result
 */
export const sendNotificationEmail = async (to, subject, notificationMessage) => {
  const htmlContent = `
    <h1>Notification</h1>
    <p>${notificationMessage}</p>
  `;
  return await sendHtmlEmail(to, subject, htmlContent);
};

