let latest = { rssi: 0, data: '', distance: -1 };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'POST') {
    latest = req.body;
    res.status(200).json({ ok: true });
  } else {
    res.status(200).json(latest);
  }
}