const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const { appendGoogleSheetData } = require('./googleSheetsService');

// Initialize express
const app = express();
app.use(bodyParser.json());

// MongoDB Schema and Model
const DataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, match: /.+@.+\..+/ },
    phone: { type: String, required: true, match: /^[0-9]{10,15}$/ } // Updated regex for phone number
});
const DataModel = mongoose.model('Data', DataSchema);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
connectDB();

// Middleware to handle validation errors
const validateData = (req, res, next) => {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'All fields (name, email, phone) are required.' });
    }
    next();
};

// POST route to add data to Google Sheets and MongoDB
app.post('/add-data', validateData, async (req, res) => {
    const { name, email, phone } = req.body;

    // Data to add to Google Sheets (array of arrays)
    const values = [[name, email, phone]];

    try {
        // Append data to Google Sheets
        await appendGoogleSheetData(process.env.SPREADSHEET_ID, 'Sheet1!A1', values);

        // Store data in MongoDB
        const newData = new DataModel({ name, email, phone });
        await newData.save();

        res.status(200).json({ message: 'Data added to both Google Sheets and MongoDB successfully.' });
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Failed to add data to Google Sheets or MongoDB.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
