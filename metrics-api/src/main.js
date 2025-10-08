// metrics-api/src/main.js
// Appwrite Functions (Node 20/22): handler receives a single context object.
// Use res.json(body, statusCode, headers) — no res.setHeader().
export default async ({ req, res, log }) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, Accept',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  try {
    const method = req.method || 'GET';

    // Preflight
    if (method === 'OPTIONS') {
      return res.json({}, 204, cors);
    }

    // Parse JSON body safely
    let body = {};
    if (req.body) {
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {}
    }

    if (method === 'GET') {
      return res.json(
        { ok: true, service: 'metrics-api', time: new Date().toISOString() },
        200,
        cors
      );
    }

    if (method === 'POST') {
      const { event, value, ...rest } = body || {};
      return res.json({ ok: true, received: { event, value, ...rest } }, 200, cors);
    }

    return res.json({ ok: false, message: 'Method not allowed' }, 405, cors);
  } catch (err) {
    return res.json({ ok: false, error: String(err?.message || err) }, 500, cors);
  }
};