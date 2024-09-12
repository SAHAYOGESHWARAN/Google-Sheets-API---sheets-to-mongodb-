const express = require('express');
const bodyParser = require('body-parser');
const { appendGoogleSheetData } = require('./googleSheetsService');
const connectDB = require('./db');

const app = express();
app.use(bodyParser.json());

connectDB();

const PORT = process.env.PORT || 5000;

// Example route to append data to Google Sheets
app.post('/add-to-sheet', async (req, res) => {
    try {
        const { spreadsheetId, range, values } = req.body;

        // Call the append function
        await appendGoogleSheetData(spreadsheetId, range, [values]);

        res.status(200).json({ message: 'Data added to Google Sheet' });
    } catch (error) {
        console.error('Error adding data to Google Sheet:', error);
        res.status(500).json({ error: 'Error adding data to Google Sheet' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
