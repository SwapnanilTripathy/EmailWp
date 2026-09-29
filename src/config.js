import 'dotenv/config';

const required = [
  'GMAIL_CLIENT_ID',
  'GMAIL_CLIENT_SECRET',
  'GMAIL_REDIRECT_URI',
  'GMAIL_REFRESH_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_RECIPIENT_NUMBER'
];

export function validateConfig() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

export const config = {
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  gmailUser: process.env.GMAIL_USER || 'me',
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 30000),
  filterTerms: (process.env.FILTER_TERMS || '').split(',').map(x => x.trim()).filter(Boolean),
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN
  },
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    recipient: process.env.WHATSAPP_RECIPIENT_NUMBER
  }
};
