import { config } from './config.js';

export async function sendWhatsAppText(text) {
  const url = `https://graph.facebook.com/v23.0/${config.whatsapp.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.whatsapp.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: config.whatsapp.recipient,
      type: 'text',
      text: { preview_url: false, body: text }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`WhatsApp API ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

export function formatEmail(email) {
  const body = email.body?.trim() || '(No readable message body)';
  return [
    '📧 *New Email*',
    '',
    `👤 From: ${email.from || 'Unknown'}`,
    `📌 Subject: ${email.subject}`,
    `🕒 ${email.date || new Date(email.internalDate).toLocaleString()}`,
    '',
    body.slice(0, 3000)
  ].join('\n');
}
