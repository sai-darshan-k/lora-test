let latest = { rssi: 0, data: '', distance: -1, distStr: '---', ts: null };

async function writeToInflux(payload) {
  const url    = 'https://us-east-1-1.aws.cloud2.influxdata.com';
  const token  = 'nZ49M1MTGbHtRCrc2OJhx-kVIBWuwvereT-o1mcq2COz3urUNuUuIIMjysObK8oOEHn8352w7LKFyrX8PQpdsA==';
  const org    = 'Agri';
  const bucket = 'smart_agri';

  const { rssi, distance, distStr, data } = payload;
  const safeData = String(data || '').replace(/[, =]/g, '_').substring(0, 64);
  const safeDist = String(distStr || '').replace(/[, =]/g, '_');

  const line = `lora_track,dist_status=${safeDist || 'none'},lora_data=${safeData || 'none'} rssi=${Math.round(rssi)}i,distance=${Number(distance).toFixed(2)}`;

  const endpoint = `${url}/api/v2/write?org=${encodeURIComponent(org)}&bucket=${encodeURIComponent(bucket)}&precision=ns`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'text/plain; charset=utf-8' },
    body: line,
  });

  if (!res.ok) console.error(`[InfluxDB] ${res.status}: ${await res.text().catch(() => '')}`);
  else console.log(`[InfluxDB] OK  rssi=${rssi}  dist=${distance}`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    const b = req.body || {};
    latest = {
      rssi:     Number(b.rssi     ?? 0),
      distance: Number(b.distance ?? -1),
      distStr:  String(b.distStr  ?? '---'),
      data:     String(b.data     ?? ''),
      ts:       Date.now(),
    };
    writeToInflux(latest).catch(e => console.error('[InfluxDB]', e));
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') return res.status(200).json(latest);

  return res.status(405).json({ error: 'Method not allowed' });
}