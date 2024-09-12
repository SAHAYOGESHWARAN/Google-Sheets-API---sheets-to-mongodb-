const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

// Path to your credentials and token files
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

// Scopes for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Load client secrets from a local file
const loadCredentials = () => {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
};

// Create an OAuth2 client with the loaded credentials
const authorize = (credentials, callback) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored token
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

// Execute authorization
const credentials = loadCredentials();
authorize(credentials, (auth) => {
    console.log('Authorization successful');
});
