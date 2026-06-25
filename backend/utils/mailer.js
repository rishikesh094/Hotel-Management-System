const nodemailer = require('nodemailer');

// Set up transporter - falls back to Ethereal SMTP for local testing
const createTransporter = async () => {
  // Return test account
  let testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"StayLuxe Platform" <no-reply@stayluxe.com>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log details to terminal so developers can copy/paste mock URLs easily!
    console.log('\n======================================================');
    console.log(`📧 EMAIL SENT TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`💬 MESSAGE:\n${text}`);
    if (html) {
      // Look for a link in the HTML and print it clearly
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`🔗 EXTRACTED LINK: ${linkMatch[1]}`);
      }
    }
    console.log(`✉️ Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log('======================================================\n');
    
    return info;
  } catch (err) {
    console.error('Error sending email: ', err);
    // Simple fallback console printer in case network fails
    console.log('\n=================== [FALLBACK EMAIL LOG] ===================');
    console.log(`EMAIL TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT: ${text}`);
    console.log('============================================================\n');
  }
};

module.exports = { sendEmail };
