const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API routes
app.use('/api/bills', require('./routes/bills'));
app.use('/api/users', require('./routes/users'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/email', require('./routes/email'));
app.use('/api/storage', require('./routes/storage'));

const MONGODB_URI = process.env.MONGODB_URI;

const mongooseOptions = {
  serverSelectionTimeoutMS: 10000,
  family: 4
};

let mongoConnection;

async function connectMongo() {
  if (mongoConnection) return mongoConnection;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoConnection = mongoose.connect(MONGODB_URI, mongooseOptions);
  return mongoConnection;
}

// Test route
app.get('/api/health', async (req, res) => {
  try {
    await connectMongo();
    res.json({
      success: true,
      message: 'BillSnap API + MongoDB connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export Express app for Vercel
module.exports = app;