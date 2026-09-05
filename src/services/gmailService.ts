import { useSettingsStore, type GmailTokens } from '../store/settingsStore';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
].join(' ');

export interface GmailRawEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  body: string;
  date: string;
}

/**
 * Build the Google OAuth consent URL. After the user consents, Google redirects
 * back to this app with ?code=... which we pick up on the callback route.
 */
export function buildAuthUrl(): string {
  const clientId = useSettingsStore.getState().getGoogleClientId();
  const redirectUri = useSettingsStore.getState().getGoogleRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Exchange the authorization code for access + refresh tokens.
 * NOTE: done client-side for this project as requested; for production this
 * exchange MUST move to a backend to avoid exposing the client secret.
 */
export async function exchangeCodeForTokens(code: string): Promise<GmailTokens> {
  const clientId = useSettingsStore.getState().getGoogleClientId();
  const clientSecret = useSettingsStore.getState().getGoogleClientSecret();
  const redirectUri = useSettingsStore.getState().getGoogleRedirectUri();

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error_description || err?.error || 'Token exchange failed');
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

/** Refresh an expired access token using the refresh token. */
export async function refreshAccessToken(refreshToken: string): Promise<GmailTokens> {
  const clientId = useSettingsStore.getState().getGoogleClientId();
  const clientSecret = useSettingsStore.getState().getGoogleClientSecret();

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Token refresh failed');

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: refreshToken,
    expiry: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

/** Ensure we have a valid (non-expired) access token, refreshing if needed. */
async function ensureValidToken(): Promise<string> {
  const { gmailTokens, setGmailTokens, getGoogleClientId, getGoogleClientSecret } =
    useSettingsStore.getState();

  if (!gmailTokens?.access_token) throw new Error('Not connected to Gmail');

  if (!getGoogleClientId() || !getGoogleClientSecret()) {
    throw new Error('Google OAuth credentials not configured');
  }

  if (gmailTokens.expiry <= Date.now() + 60000) {
    if (!gmailTokens.refresh_token) {
      throw new Error('Session expired. Please reconnect Gmail.');
    }
    const refreshed = await refreshAccessToken(gmailTokens.refresh_token);
    setGmailTokens(refreshed);
    return refreshed.access_token;
  }

  return gmailTokens.access_token;
}

/** Fetch a list of email ids from the inbox (optionally filtered). */
export async function listInboxEmails(
  maxResults = 20,
  query = 'newer_than:30d'
): Promise<Array<{ id: string; threadId: string }>> {
  const token = await ensureValidToken();
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    q: query,
    labelIds: 'INBOX',
  });
  const res = await fetch(`${GMAIL_API}/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch inbox');
  const data = await res.json();
  return data.messages || [];
}

/** Fetch the full metadata + body of a single email. */
export async function getEmail(id: string): Promise<GmailRawEmail> {
  const token = await ensureValidToken();
  const res = await fetch(`${GMAIL_API}/messages/${id}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch email');
  const msg = await res.json();

  const headers: Record<string, string> = {};
  for (const h of msg.payload?.headers || []) {
    headers[h.name?.toLowerCase()] = h.value;
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject: headers.subject || '(no subject)',
    from: headers.from || '',
    date: headers.date || '',
    body: extractPlainText(msg.payload),
  };
}

/** Recursively extract plain-text body from a Gmail message payload. */
function extractPlainText(payload: any): string {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    try {
      return decodeBase64(payload.body.data);
    } catch {
      return '';
    }
  }
  if (payload.mimeType === 'multipart/alternative' || payload.mimeType === 'multipart/mixed') {
    // Prefer text/plain part
    for (const part of payload.parts || []) {
      if (part.mimeType === 'text/plain') {
        return extractPlainText(part);
      }
    }
    // Fallback to first text part
    for (const part of payload.parts || []) {
      if (part.mimeType?.startsWith('text/')) {
        return extractPlainText(part);
      }
    }
  }
  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }
  return '';
}

function decodeBase64(data: string): string {
  // Normalize URL-safe base64 and decode
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  // Try UTF-8 decode
  try {
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return binary;
  }
}

/** Get the connected Gmail account's primary email address. */
export async function getProfileEmail(): Promise<string> {
  const token = await ensureValidToken();
  const res = await fetch(`${GMAIL_API}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Gmail profile');
  const data = await res.json();
  return data.emailAddress || '';
}

/** High-level: scan the real inbox and return emails that look actionable/task-like. */
export async function fetchActionableEmails(maxResults = 20): Promise<GmailRawEmail[]> {
  const messages = await listInboxEmails(maxResults);
  const emails: GmailRawEmail[] = [];
  // Process in small batches to stay within rate limits
  for (let i = 0; i < messages.length; i++) {
    const email = await getEmail(messages[i].id);
    emails.push(email);
  }
  return emails;
}
