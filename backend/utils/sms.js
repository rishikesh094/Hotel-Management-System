// Helper to generate a 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simulated SMS sender
const sendSms = async (phone, message) => {
  console.log('\n======================================================');
  console.log(`📱 SMS SENT TO: ${phone}`);
  console.log(`💬 MESSAGE: ${message}`);
  console.log('======================================================\n');
  return true;
};

module.exports = { generateOtp, sendSms };
