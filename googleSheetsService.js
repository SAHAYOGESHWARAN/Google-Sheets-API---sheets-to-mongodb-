const fs = require('fs');
const { google } = require('googleapis');
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Load client secrets from a local file and authenticate
const authenticate = () => {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
    } else {
        getNewToken(oAuth2Client);
    }
    return oAuth2Client;
};

// Generate a new token if needed
const getNewToken = (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            console.log('Token stored to', TOKEN_PATH);
            rl.close();
        });
    });
};

// Append data to Google Sheet
const appendGoogleSheetData = async (spreadsheetId, range, values) => {
    const auth = authenticate();
    const sheets = google.sheets({ version: 'v4', auth });

    const resource = {
        values, // The data to append
    };

    try {
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW', // 'RAW' or 'USER_ENTERED'
            resource,
        });
        console.log(`${result.data.updates.updatedCells} cells updated.`);
    } catch (err) {
        console.error('Error appending data:', err);
    }
};

module.exports = { appendGoogleSheetData };
