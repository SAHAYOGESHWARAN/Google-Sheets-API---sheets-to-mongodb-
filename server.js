const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();  // To load .env variables
const { appendGoogleSheetData } = require('./googleSheetsService');

// Initialize express
const app = express();
app.use(bodyParser.json());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Call the function to connect to the database
connectDB();

// Define a simple MongoDB model for data storage
const DataSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String
});
const DataModel = mongoose.model('Data', DataSchema);

// POST route to insert data into Google Sheets and MongoDB
app.post('/add-data', async (req, res) => {
    const { name, email, phone } = req.body;
    
    // The data to be stored
    const values = [name, email, phone];
    
    try {
        // Insert data into Google Sheets
        await appendGoogleSheetData(process.env.SPREADSHEET_ID, 'Sheet1!A1', [values]);  // Adjust range as needed

        // Store data in MongoDB
        const newData = new DataModel({ name, email, phone });
        await newData.save();

        res.status(200).json({ message: 'Data added to both Google Sheets and MongoDB' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error adding data to Google Sheets or MongoDB' });
    }
});

// Define the PORT and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
