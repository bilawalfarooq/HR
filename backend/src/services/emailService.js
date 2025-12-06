import logger from '../utils/logger.js';

/**
 * Send email (Mock implementation)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} options.html - Email HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    // In a real application, use nodemailer or an email service provider (SendGrid, AWS SES, etc.)

    logger.info('----------------------------------------------------');
    logger.info(`📧 EMAIL SENT TO: ${to}`);
    logger.info(`SUBJECT: ${subject}`);
    logger.info(`CONTENT: ${text || 'HTML Content'}`);
    logger.info('----------------------------------------------------');

    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return true;
};

export default {
    sendEmail
};
