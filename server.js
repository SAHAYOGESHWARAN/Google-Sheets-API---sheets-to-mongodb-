const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const { appendGoogleSheetData, getGoogleSheetData } = require('./googleSheetsService');

// Initialize express
const app = express();
app.use(bodyParser.json());

// MongoDB Schema and Model
const DataSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
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

// POST route to add data to Google Sheets and MongoDB
app.post('/add-data', async (req, res) => {
    const { name, email, phone } = req.body;
    const values = [[name, email, phone]];

    try {
        // Append data to Google Sheets
        await appendGoogleSheetData(process.env.SPREADSHEET_ID, 'Sheet1!A2', values);

        // Store data in MongoDB
        const newData = new DataModel({ name, email, phone });
        await newData.save();

        res.status(200).json({ message: 'Data added to both Google Sheets and MongoDB successfully.' });
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Failed to add data to Google Sheets or MongoDB.' });
    }
});

// GET route to retrieve data from Google Sheets
app.get('/get-data', async (req, res) => {
    try {
        const data = await getGoogleSheetData(process.env.SPREADSHEET_ID, 'Sheet1!A:C');
        res.status(200).json({ data });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Failed to retrieve data from Google Sheets.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
