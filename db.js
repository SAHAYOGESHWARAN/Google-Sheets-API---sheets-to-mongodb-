const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// MongoDB connection URI from environment variables
const uri = process.env.MONGO_URI;

/**
 * Connect to MongoDB with advanced options and error handling.
 */
const connectDB = async () => {
    if (!uri) {
        console.error('MONGO_URI is not defined in the .env file');
        process.exit(1);
    }

    // Connection options
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false, // Disable autoIndexing for production
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
        connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
        socketTimeoutMS: 45000, // 45 seconds timeout for socket inactivity
    };

    const connectWithRetry = async () => {
        try {
            await mongoose.connect(uri, options);
            console.log('MongoDB connected successfully...');
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
        }
    };

    connectWithRetry(); // Initial connection attempt
};

// Listen to Mongoose events for more detailed logging
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected from MongoDB');
});

// Gracefully handle process termination
process.on('SIGINT', async () => {
    console.log('SIGINT signal received. Closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB;
