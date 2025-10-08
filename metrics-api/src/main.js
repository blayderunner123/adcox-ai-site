// Appwrite Node 20/22: handler receives a single context object
// Destructure req/res from it.
export default async ({ req, res, log }) => {
  try {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    const method = req.method || 'GET';
    if (method === 'OPTIONS') {
      return res.send('');
    }

    // Parse JSON body if present
    let body = {};
    if (req.body) {
      try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch {}
    }

    if (method === 'GET') {
      return res.json({
        ok: true,
        service: 'metrics-api',
        time: new Date().toISOString()
      });
    }

    if (method === 'POST') {
      const { event, value, ...rest } = body || {};
      return res.json({
        ok: true,
        received: { event, value, ...rest }
      });
    }

    return res.json({ ok: false, message: 'Method not allowed' });
  } catch (err) {
    // Return error details so we don't get a silent 500
    return res.json({ ok: false, error: String(err?.message || err) });
  }
};