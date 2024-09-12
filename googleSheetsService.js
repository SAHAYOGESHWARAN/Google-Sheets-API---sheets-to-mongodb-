const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const authenticate = () => {
    if (!fs.existsSync('credentials.json')) {
        throw new Error('credentials.json file not found. Make sure you have downloaded it from Google Cloud Console.');
    }

    const credentials = JSON.parse(fs.readFileSync('credentials.json'));

    if (!credentials.installed) {
        throw new Error('Invalid credentials format. Make sure your credentials.json file contains "installed" section.');
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
    } else {
        getNewToken(oAuth2Client);
    }
    return oAuth2Client;
};

// Function to get new OAuth token
const getNewToken = (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
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

// Function to fetch data from Google Sheets
const getGoogleSheetData = async (spreadsheetId, range) => {
    const auth = authenticate();
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return res.data.values;
};

// Function to append data to Google Sheets
const appendGoogleSheetData = async (spreadsheetId, range, values) => {
    const auth = authenticate();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const resource = {
        values,  // The data to append
    };

    try {
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',  // You can use 'RAW' or 'USER_ENTERED' for formatting
            resource,
        });
        console.log(`${result.data.updates.updatedCells} cells updated.`);
    } catch (err) {
        console.error('Error appending data:', err);
    }
};

module.exports = { getGoogleSheetData, appendGoogleSheetData };
