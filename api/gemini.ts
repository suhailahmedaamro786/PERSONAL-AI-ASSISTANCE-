// Serverless proxy for Google Gemini.
//
// The Gemini API key lives ONLY here on the server (process.env.GEMINI_API_KEY)
// so it is never shipped to the browser. The client sends just the prompt/model
// payload to /api/gemini; this function appends the key and relays the response.
//
// An optional "apiKey" override in the request body is honored so users who
// supply their own key in Settings can still use it — but the project's shared
// key is never exposed in the client bundle.

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request): Promise<Response> {
  const json = (status: number, payload: unknown): Response =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body: {
    contents?: unknown;
    generationConfig?: unknown;
    apiKey?: string;
    model?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  // Prefer a per-request user key, else the server-side project key.
  const serverKey = process.env.GEMINI_API_KEY;
  const key = (body.apiKey && body.apiKey.trim()) || serverKey || '';
  if (!key) {
    return json(500, { error: 'GEMINI_API_KEY not configured on server' });
  }

  const payload = {
    contents: body.contents,
    generationConfig: body.generationConfig,
  };

  const models = [body.model || 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return json(200, { text });
      }
    } catch {
      // try next model
    }
  }

  return json(502, { error: 'Gemini request failed' });
}