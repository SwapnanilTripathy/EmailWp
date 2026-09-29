# Email → WhatsApp

Automatically forward new Gmail emails to a WhatsApp number using the official WhatsApp Cloud API.

## Flow

```text
Gmail inbox
   ↓
Gmail API polling
   ↓
Email parser/filter
   ↓
WhatsApp Cloud API
   ↓
Your WhatsApp
```

## Requirements

- Node.js 20+
- A Google Cloud project with Gmail API enabled
- Gmail OAuth 2.0 credentials
- A Meta developer app with WhatsApp Cloud API configured
- A WhatsApp Business phone number / Cloud API setup

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in the values in `.env`.

### 3. Gmail OAuth

Create an OAuth client in Google Cloud for a **Web application** and add:

```text
http://localhost:3000/auth/google/callback
```

to the authorized redirect URIs.

Start the server:

```bash
npm start
```

Open:

```text
http://localhost:3000/auth/google
```

Authorize Gmail access. The callback displays a refresh token. Put it in `GMAIL_REFRESH_TOKEN` and restart the server.

For production, set `GMAIL_REDIRECT_URI` and `BASE_URL` to your deployed HTTPS URL and add that callback URL to Google Cloud.

### 4. WhatsApp Cloud API

Put your Meta Cloud API access token, phone number ID and recipient number into `.env`.

The recipient should use international format without `+`, spaces or dashes, e.g. `919876543210`.

### 5. Run

```bash
npm start
```

The service checks Gmail every `POLL_INTERVAL_MS` milliseconds and forwards newly detected messages.

## API endpoints

- `GET /` — service status
- `GET /health` — health check
- `GET /auth/google` — start Gmail OAuth
- `GET /auth/google/callback` — OAuth callback
- `POST /check-now` — manually check Gmail

## Filtering

To forward only matching emails, set:

```env
FILTER_TERMS=college@example.com,OTP,important
```

The terms are matched case-insensitively against the sender, subject and body.

Leave `FILTER_TERMS` empty to forward all newly detected emails.

## Security

- Never commit `.env` or OAuth tokens.
- Use HTTPS in production.
- Store secrets in your deployment platform's environment variables.
- Restrict Google OAuth scopes to the minimum required.

## Important WhatsApp behavior

The WhatsApp Cloud API has Meta's messaging/template rules. Depending on the conversation state and message type, a template may be required. This project sends a normal text message through the Cloud API; if Meta rejects a message because of its current messaging policy, configure an approved template and adapt `src/whatsapp.js` accordingly.
