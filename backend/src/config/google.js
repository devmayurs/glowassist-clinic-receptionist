const { google } = require('googleapis');
require('dotenv').config();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

if (!googleClientId || !googleClientSecret || !googleRefreshToken) {
  console.warn(
    'WARNING: Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) are missing.'
  );
}

const oauth2Client = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  googleRedirectUri
);

// Set the refresh token credentials for continuous token exchanges
oauth2Client.setCredentials({
  refresh_token: googleRefreshToken
});

const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client
});

module.exports = {
  oauth2Client,
  calendar
};
