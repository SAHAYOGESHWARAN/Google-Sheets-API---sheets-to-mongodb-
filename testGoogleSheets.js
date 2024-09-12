const { appendGoogleSheetData } = require('./googleSheetsService');

// Example usage
const addDataToSheet = async () => {
    try {
        await appendGoogleSheetData('SPREADSHEET_ID', 'Sheet1!A1', [['Example Name', 'example@example.com', '1234567890']]);
        console.log('Data added successfully.');
    } catch (error) {
        console.error('Failed to add data:', error.message);
    }
};

addDataToSheet();
