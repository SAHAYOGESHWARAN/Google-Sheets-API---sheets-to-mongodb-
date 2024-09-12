const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Paths to credentials and token files
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Scopes required for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Load OAuth2 client secrets and create an OAuth2 client.
 * @returns {google.auth.OAuth2} The OAuth2 client.
 */
const loadOAuth2Client = () => {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

/**
 * Load or refresh OAuth2 token.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client.
 * @returns {Promise<void>}
 */
const authorize = async (oAuth2Client) => {
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        return;
    }
    await getNewToken(oAuth2Client);
};

/**
 * Generate and save a new token after user authorization.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client.
 * @returns {Promise<void>}
 */
const getNewToken = async (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this URL:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', async (code) => {
            rl.close();
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                oAuth2Client.setCredentials(tokens);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                console.log('Token stored to', TOKEN_PATH);
                resolve();
            } catch (err) {
                console.error('Error retrieving access token', err);
                reject(err);
            }
        });
    });
};

/**
 * Append data to a Google Sheet.
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} range The range to append data to.
 * @param {Array<Array<string>>} values The data to append.
 * @returns {Promise<void>}
 */
const appendGoogleSheetData = async (spreadsheetId, range, values) => {
    const auth = loadOAuth2Client();
    await authorize(auth);
    const sheets = google.sheets({ version: 'v4', auth });

    const resource = { values };

    try {
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource,
        });
        console.log(`${result.data.updates.updatedCells} cells updated.`);
    } catch (err) {
        console.error('Error appending data:', err);
        throw err; // Rethrow the error to handle it upstream
    }
};

module.exports = { appendGoogleSheetData };
