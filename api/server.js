const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Fix for Node.js v18+ SRV lookup issue with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from root
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/billsnap';

mongoose.set('strictQuery', false);

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    family: 4 // Force IPv4 — fixes SRV resolution on Node v24
};

async function startApp() {
    // Routes
    app.use('/api/bills', require('./routes/bills'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/expenses', require('./routes/expenses'));
    app.use('/api/ocr', require('./routes/ocr'));
    app.use('/api/email', require('./routes/email'));
    app.use('/api/storage', require('./routes/storage'));

    // Serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

    const PORT = process.env.PORT || 5000;
    // Seed dev user (non-production) after routes are registered and before listening
    try {
        await seedDevUser();
    } catch (err) {
        console.warn('Seed user error (ignored):', err.message || err);
    }

    app.listen(PORT, () => {
        console.log(`🚀 BillSnap server running on port ${PORT}`);
    });
}

// Development-only: seed a default user when DB is empty
async function seedDevUser() {
    try {
        if (process.env.NODE_ENV === 'production') return;
        const User = require('../models/User');
        const count = await User.countDocuments();
        if (count === 0) {
            console.log('🌱 No users found — creating development seed user: dev@local.com / password123');
            const devUser = new User({ name: 'Dev User', email: 'dev@local.com', password: 'password123' });
            await devUser.save();
            console.log('✅ Dev user created');
        }
    } catch (err) {
        console.warn('Seed user creation failed:', err.message || err);
    }
}

async function connectMongo(uri, label) {
    console.log(`🔌 Connecting to ${label}...`);
    await mongoose.connect(uri, mongooseOptions);
    console.log(`✅ Connected to ${label}`);
}

async function startServer() {
    try {
        if (MONGODB_URI) {
            try {
                await connectMongo(MONGODB_URI, 'MongoDB Atlas');
                await startApp();
                return;
            } catch (error) {
                console.error('❌ MongoDB Atlas connection failed:', error);
                console.error('   - If you are using Atlas, make sure your current IP address is allowed in the cluster IP access list.');
                console.error('   - If you want to run locally instead, either remove MONGODB_URI from .env or add a local MongoDB instance at mongodb://localhost:27017/billsnap.');
            }
        }

        // Try local MongoDB next
        try {
            console.warn('⚠️  Falling back to local MongoDB at mongodb://localhost:27017/billsnap');
            await connectMongo(LOCAL_MONGODB_URI, 'local MongoDB');
            await startApp();
            return;
        } catch (localErr) {
            console.error('❌ Local MongoDB connection failed:', localErr.message || localErr);
            console.warn('⚠️  Attempting in-memory MongoDB for development...');

            // Start an in-memory MongoDB for quick local development/testing
            const mongod = await MongoMemoryServer.create();
            const memUri = mongod.getUri();
            await connectMongo(memUri, 'in-memory MongoDB');
            await startApp();
            return;
        }
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message || err);
        process.exit(1);
    }
}

startServer();

module.exports = app;
