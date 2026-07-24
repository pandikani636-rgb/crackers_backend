const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  console.log('[Mailer Config Check]:', {
    SMTP_HOST: process.env.SMTP_HOST || 'undefined',
    SMTP_PORT: process.env.SMTP_PORT || 'undefined',
    SMTP_USER: process.env.SMTP_USER || 'undefined',
    SMTP_PASS: process.env.SMTP_PASS ? 'PRESENT (hidden)' : 'MISSING',
    SMTP_SECURE: process.env.SMTP_SECURE || 'undefined'
  });

  const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!isSmtpConfigured) {
    console.log('\n=== MOCK EMAIL SENT ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('HTML content generated successfully.');
    console.log('========================\n');
    return { mock: true, messageId: 'mock-id-' + Date.now() };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"Sparklers Premium Showroom" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
