const express = require('express');
const bodyParser = require('body-parser');
const { appendGoogleSheetData } = require('./googleSheetsService');

// Initialize express
const app = express();
app.use(bodyParser.json());

// POST route to add data to Google Sheets
app.post('/add-data', async (req, res) => {
    const { name, email, phone } = req.body;

    // Data to add to the Google Sheet (array of arrays)
    const values = [[name, email, phone]];

    try {
        // Append data to Google Sheet
        await appendGoogleSheetData(process.env.SPREADSHEET_ID, 'Sheet1!A1', values);  // Adjust range if needed

        res.status(200).json({ message: 'Data added to Google Sheets successfully.' });
    } catch (error) {
        console.error('Error adding data to Google Sheet:', error);
        res.status(500).json({ error: 'Failed to add data to Google Sheets.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
