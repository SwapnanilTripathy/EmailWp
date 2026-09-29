import { google } from 'googleapis';
import { config } from './config.js';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

function oauthClient() {
  return new google.auth.OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    config.gmail.redirectUri
  );
}

export function getAuthUrl() {
  const client = oauthClient();
  return client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES });
}

export async function exchangeCode(code) {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

function gmailClient() {
  const auth = oauthClient();
  auth.setCredentials({ refresh_token: config.gmail.refreshToken });
  return google.gmail({ version: 'v1', auth });
}

function header(headers, name) {
  return headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

function decodeBase64Url(data = '') {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function extractText(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodeBase64Url(payload.body.data).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  for (const part of payload.parts || []) {
    const result = extractText(part);
    if (result) return result;
  }
  return '';
}

export async function listNewMessageIds(afterInternalDate) {
  const gmail = gmailClient();
  const q = afterInternalDate ? `after:${Math.floor(afterInternalDate / 1000)}` : 'newer_than:1d';
  const res = await gmail.users.messages.list({ userId: config.gmailUser, q, maxResults: 25 });
  return (res.data.messages || []).map(m => m.id);
}

export async function getMessage(id) {
  const gmail = gmailClient();
  const res = await gmail.users.messages.get({ userId: config.gmailUser, id, format: 'full' });
  const data = res.data;
  const headers = data.payload?.headers || [];
  return {
    id: data.id,
    threadId: data.threadId,
    internalDate: Number(data.internalDate || Date.now()),
    from: header(headers, 'From'),
    to: header(headers, 'To'),
    subject: header(headers, 'Subject') || '(No subject)',
    date: header(headers, 'Date'),
    body: extractText(data.payload).slice(0, 3500)
  };
}
