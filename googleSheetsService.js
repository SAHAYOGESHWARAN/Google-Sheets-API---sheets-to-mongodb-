const { google } = require('googleapis');
const fs = require('fs');
const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const authenticate = () => {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
    } else {
        // If not, guide the user to authorize
        // Generate auth URL and handle token storage
    }
    return oAuth2Client;
};

const getGoogleSheetData = async (spreadsheetId, range) => {
    const auth = authenticate();
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return res.data.values;
};

// Inside googleSheetsService.js
oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
});

module.exports = { getGoogleSheetData };
