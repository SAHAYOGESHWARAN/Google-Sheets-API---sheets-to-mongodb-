const fs = require('fs');
const { google } = require('googleapis');

// Load credentials and token
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Load client secrets from a local file
const loadCredentials = () => {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
};

// Create an OAuth2 client with the loaded credentials
const authorize = (callback) => {
    const { client_secret, client_id, redirect_uris } = loadCredentials().installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
};

// Get and store a new token after prompting for user authorization
const getNewToken = (oAuth2Client, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
};

// Append data to Google Sheets
const appendGoogleSheetData = async (spreadsheetId, range, values) => {
    try {
        authorize(async (auth) => {
            const sheets = google.sheets({ version: 'v4', auth });
            const resource = { values };
            const result = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                resource,
            });
            console.log('Data appended:', result.data);
        });
    } catch (error) {
        console.error('Error appending data:', error);
    }
};

// Get data from Google Sheets
const getGoogleSheetData = async (spreadsheetId, range) => {
    try {
        return new Promise((resolve, reject) => {
            authorize(async (auth) => {
                const sheets = google.sheets({ version: 'v4', auth });
                const result = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });
                resolve(result.data.values);
            });
        });
    } catch (error) {
        console.error('Error retrieving data:', error);
        throw error;
    }
};

module.exports = {
    appendGoogleSheetData,
    getGoogleSheetData,
};
