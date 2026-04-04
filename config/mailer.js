const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter
 * Using ethereal.email for development or environment-provided SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.ethereal.email',
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_PORT == 465, // Use true for Port 465, false for others
  auth: {
    user: process.env.MAIL_USER || 'testuser@ethereal.email',
    pass: process.env.MAIL_PASS || 'testpass'
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Mailer: Transporter configuration is incomplete or incorrect. Using mock logs.');
  } else {
    console.log('📬 Mailer: Server is ready to take our messages');
  }
});

/**
 * Send an HTML email
 * @param {string} to Recipient email
 * @param {string} subject Email subject
 * @param {string} html HTML content
 */
const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.STORE_NAME || 'EcomSphere'}" <${process.env.MAIL_FROM || 'support@ecomsphere.com'}>`,
      to,
      subject,
      html
    });
    
    // For ethereal development: log the preview URL
    if (info.messageId && !process.env.MAIL_HOST) {
       console.log('📧 Message sent: %s', info.messageId);
       console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('❌ Mailer error:', error);
    return null;
  }
};

module.exports = { sendMail };
