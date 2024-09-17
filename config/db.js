const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Connecting to MongoDB using the connection string from .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
