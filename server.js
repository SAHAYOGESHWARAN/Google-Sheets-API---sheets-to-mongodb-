const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { getGoogleSheetData } = require('./googleSheetsService');
const SheetData = require('./models/SheetData');
const connectDB = require('./db');

const app = express();
app.use(bodyParser.json());
connectDB();

const spreadsheetId = 'your-google-spreadsheet-id';
const range = 'Sheet1!A1:C100'; // Modify based on your sheet structure

app.get('/fetch-and-store', async (req, res) => {
    try {
        const sheetData = await getGoogleSheetData(spreadsheetId, range);
        
        // Assume sheetData is an array of rows
        for (let row of sheetData) {
            const [name, email, age] = row;
            await SheetData.create({ name, email, age });
        }
        res.send('Data successfully stored in MongoDB');
    } catch (error) {
        console.error('Error fetching or storing data:', error);
        res.status(500).send('Error occurred');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
