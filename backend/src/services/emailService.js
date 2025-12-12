import logger from '../utils/logger.js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create email transporter
 */
const createTransporter = () => {
    // Check if email configuration exists
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    return null;
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} options.html - Email HTML content
 * @param {string} options.attachment - Path to attachment file
 */
export const sendEmail = async ({ to, subject, text, html, attachment }) => {
    const transporter = createTransporter();

    if (!transporter) {
        // Fallback to logging if email not configured
        logger.info('----------------------------------------------------');
        logger.info(`📧 EMAIL (MOCK) TO: ${to}`);
        logger.info(`SUBJECT: ${subject}`);
        logger.info(`CONTENT: ${text || 'HTML Content'}`);
        if (attachment) {
            logger.info(`ATTACHMENT: ${attachment}`);
        }
        logger.info('----------------------------------------------------');
        logger.info('⚠️  Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env');
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        // Add attachment if provided
        if (attachment && fs.existsSync(attachment)) {
            mailOptions.attachments = [{
                filename: path.basename(attachment),
                path: attachment
            }];
        }

        const info = await transporter.sendMail(mailOptions);
        logger.info(`📧 Email sent successfully to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
};

export default {
    sendEmail
};
