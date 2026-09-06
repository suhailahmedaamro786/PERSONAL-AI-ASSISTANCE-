// Serverless proxy for the Google OAuth token exchange.
//
// The Google client secret lives ONLY here on the server
// (process.env.GOOGLE_CLIENT_SECRET) so it is never shipped to the browser.
// The client sends { grant_type, code?, refresh_token?, redirect_uri? } as JSON;
// this function builds the application/x-www-form-urlencoded request, adds the
// secret and client_id server-side, exchanges with Google, and returns a clean
// { access_token, refresh_token, expires_in } object.

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request): Promise<Response> {
  const json = (status: number, payload: unknown): Response =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return json(500, { error: 'Google OAuth credentials not configured on server' });
  }

  let body: {
    grant_type?: string;
    code?: string;
    refresh_token?: string;
    redirect_uri?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const grantType = body.grant_type;
  if (grantType !== 'authorization_code' && grantType !== 'refresh_token') {
    return json(400, { error: 'Unsupported grant_type' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: grantType,
  });
  if (grantType === 'authorization_code') {
    if (!body.code) return json(400, { error: 'Missing code' });
    params.set('code', body.code);
    params.set('redirect_uri', body.redirect_uri || '');
  } else {
    if (!body.refresh_token) return json(400, { error: 'Missing refresh_token' });
    params.set('refresh_token', body.refresh_token);
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json(res.status, {
        error: data.error_description || data.error || 'Token exchange failed',
      });
    }
    return json(200, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch {
    return json(502, { error: 'Google token exchange failed' });
  }
}