import express from 'express';
import { config, validateConfig } from './config.js';
import { exchangeCode, getAuthUrl } from './gmail.js';
import { checkInbox } from './processor.js';

validateConfig();
const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.json({ service: 'email-to-whatsapp', status: 'running' }));
app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.get('/auth/google', (_req, res) => res.redirect(getAuthUrl()));

app.get('/auth/google/callback', async (req, res) => {
  try {
    if (!req.query.code) return res.status(400).send('Missing OAuth code');
    const tokens = await exchangeCode(req.query.code);
    res.type('text').send(`Gmail authorization complete.\n\nRefresh token:\n${tokens.refresh_token || '(No refresh token returned; revoke access and authorize again with consent.)'}\n\nPut the refresh token into GMAIL_REFRESH_TOKEN in your environment.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Google OAuth failed. Check the server logs.');
  }
});

app.post('/check-now', async (_req, res) => {
  try { res.json(await checkInbox()); }
  catch (error) { console.error(error); res.status(500).json({ error: error.message }); }
});

app.listen(config.port, () => {
  console.log(`Email → WhatsApp running on ${config.baseUrl}`);
  console.log(`Health: ${config.baseUrl}/health`);
  checkInbox().catch(err => console.error('Initial check failed:', err.message));
  setInterval(() => checkInbox().catch(err => console.error('Scheduled check failed:', err.message)), config.pollIntervalMs);
});
