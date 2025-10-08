// Minimal HTTP handler with CORS and JSON echo
export default async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  const method = req.method || 'GET';
  if (method === 'OPTIONS') {
    // Preflight
    return res.send('');
  }

  // Parse JSON body if present
  let body = {};
  try {
    if (req.body) body = JSON.parse(req.body);
  } catch {}

  if (method === 'GET') {
    return res.json({
      ok: true,
      service: 'metrics-api',
      time: new Date().toISOString()
    });
  }

  if (method === 'POST') {
    // Echo back what was sent
    const { event, value, ...rest } = body || {};
    return res.json({
      ok: true,
      received: { event, value, ...rest }
    });
  }

  // Keep it simple for now
  return res.json({ ok: false, message: 'Method not allowed' });
};