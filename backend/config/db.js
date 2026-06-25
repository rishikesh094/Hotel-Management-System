const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️  Please ensure local MongoDB is running or update MONGO_URI in backend/.env to a live connection (e.g. MongoDB Atlas)`);
  }
};

module.exports = connectDB;
