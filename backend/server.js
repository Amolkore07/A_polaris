import express from 'express';
import cors from 'cors';
import {
  stations, skus, institutes, indents,
  cratesInitial, scanEventsInitial, peopleInitial,
  stockInitial, incidentsInitial, playbooks, LEGS
} from './seed.js';

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

// In-memory store (prototype). Render free tier is ephemeral, fine for demo.
let crates = JSON.parse(JSON.stringify(cratesInitial));
let scanEvents = JSON.parse(JSON.stringify(scanEventsInitial));
let people = JSON.parse(JSON.stringify(peopleInitial));
let stock = JSON.parse(JSON.stringify(stockInitial));
let incidents = JSON.parse(JSON.stringify(incidentsInitial));
let musters = [];
let idCounter = 100;

const skuById = (id) => skus.find((s) => s.id === id);
const stationById = (id) => stations.find((s) => s.id === id);

// Days until 1 Dec from a fixed demo date (keeps winter flag stable for judges)
const DAYS_UNTIL_DEC = 240;
function stockWithCover(stationId) {
  return stock
    .filter((s) => !stationId || s.stationId === stationId)
    .map((s) => {
      const sku = skuById(s.skuId);
      const doc = sku.perDay > 0 ? Math.floor(s.qty / sku.perDay) : 9999;
      return {
        ...s,
        skuName: sku.name,
        category: sku.category,
        unit: sku.unit,
        perDay: sku.perDay,
        daysOfCover: doc,
        winterOk: doc >= DAYS_UNTIL_DEC,
        stationName: stationById(s.stationId)?.name
      };
    });
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'polaris-backend', time: new Date().toISOString() }));

app.get('/api/overview', (req, res) => {
  res.json({
    expedition: { name: '43-ISEA demo', cost: 'Rs 200M', voyage: '12000 nm / 94 days', winter: '8-month cutoff Mar-Nov' },
    counts: {
      stations: stations.length,
      crates: crates.length,
      indents: indents.length,
      people: people.length,
      incidentsOpen: incidents.filter((i) => i.status === 'open').length
    },
    route: ['NCPOR Goa', 'Mumbai', 'Cape Town / DROMLAN', 'Vessel / IL-76 (18T air lane)', 'Maitri', 'Bharati (3000 km)', 'Himadri'],
    note: 'NavIC stops at 30S. Prototype uses GPS+GLONASS+Galileo coords.'
  });
});

app.get('/api/stations', (req, res) => res.json(stations));
app.get('/api/skus', (req, res) => res.json(skus));
app.get('/api/institutes', (req, res) => res.json(institutes));
app.get('/api/indents', (req, res) => res.json(indents));
app.post('/api/indents', (req, res) => {
  const { institute, skuId, qty, priority, lane } = req.body;
  if (!institute || !skuId || !qty) return res.status(400).json({ error: 'institute, skuId, qty required' });
  const sku = skuById(skuId);
  if (!sku) return res.status(400).json({ error: 'invalid skuId' });
  const ind = {
    id: 'ind' + (++idCounter),
    institute, skuId,
    qty: Number(qty),
    priority: Number(priority) || 2,
    hazmat: !!sku.hazmat,
    lane: lane === 'air' ? 'air' : 'ship',
    status: 'pending'
  };
  indents.push(ind);
  res.json(ind);
});
app.post('/api/crates', (req, res) => {
  const { skuId, qty, lane } = req.body;
  if (!skuId || !qty) return res.status(400).json({ error: 'skuId and qty required' });
  const sku = skuById(skuId);
  if (!sku) return res.status(400).json({ error: 'invalid skuId' });
  const n = crates.length + 101;
  const crate = {
    id: 'CR-' + n,
    qr: 'POL-' + n,
    skuId, qty: Number(qty),
    leg: 'Goa', status: 'packed',
    hazmat: !!sku.hazmat,
    lane: lane === 'air' ? 'air' : 'ship'
  };
  crates.push(crate);
  scanEvents.push({ id: 'se' + (++idCounter), crateId: crate.id, leg: 'Goa', at: new Date().toISOString(), actor: 'NCPOR Goa', note: crate.id + ' packed at Goa' });
  res.json(crate);
});
app.post('/api/people', (req, res) => {
  const { name, role, nationality, stationId, stage } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'name and role required' });
  const p = {
    id: 'p' + (++idCounter),
    name, role,
    nationality: nationality || 'Indian',
    medical: 'pending', medicalFlag: false,
    training: 'pending',
    skills: req.body.skills || '',
    stationId: stationId || null,
    stage: stage || 'application',
    allowancePerDay: 0
  };
  people.push(p);
  res.json(p);
});
app.post('/api/stock/add', (req, res) => {
  const { stationId, skuId, qty } = req.body;
  if (!stationId || !skuId || qty == null) return res.status(400).json({ error: 'stationId, skuId, qty required' });
  let row = stock.find((s) => s.stationId === stationId && s.skuId === skuId);
  if (row) row.qty += Number(qty);
  else { row = { stationId, skuId, qty: Number(qty) }; stock.push(row); }
  res.json({ ok: true, row });
});
app.get('/api/legs', (req, res) => res.json(LEGS));
app.get('/api/playbooks', (req, res) => res.json(playbooks));

app.get('/api/crates', (req, res) => {
  const out = crates.map((c) => ({ ...c, skuName: skuById(c.skuId)?.name }));
  res.json(out);
});

app.get('/api/scan-events', (req, res) => res.json(scanEvents.slice().reverse()));

app.post('/api/scan', (req, res) => {
  const { crateId, leg, actor } = req.body;
  if (!crateId || !leg) return res.status(400).json({ error: 'crateId and leg required' });
  const crate = crates.find((c) => c.id === crateId);
  if (!crate) return res.status(404).json({ error: 'crate not found' });
  if (!LEGS.includes(leg)) return res.status(400).json({ error: 'invalid leg' });
  crate.leg = leg;
  if (leg === 'Station') crate.status = 'delivered';
  else crate.status = 'in-transit';
  const ev = {
    id: 'se' + (++idCounter),
    crateId,
    leg,
    at: new Date().toISOString(),
    actor: actor || 'Prototype scan',
    note: `${crateId} scanned at ${leg}`
  };
  scanEvents.push(ev);
  res.json({ ok: true, crate, event: ev });
});

// Greedy planner: priority first, hazmat separated, air lane capped at 18T
app.post('/api/planner/run', (req, res) => {
  const lane = req.body?.lane || 'all'; // ship | air | all
  const list = indents
    .filter((i) => lane === 'all' || i.lane === lane)
    .slice()
    .sort((a, b) => a.priority - b.priority);
  let airKg = 0;
  const AIR_CAP = 18000;
  const packed = [];
  const skipped = [];
  for (const ind of list) {
    const sku = skuById(ind.skuId);
    const kg = sku.weightKg * ind.qty;
    const m3 = +(sku.volumeM3 * ind.qty).toFixed(2);
    if (ind.lane === 'air') {
      if (airKg + kg > AIR_CAP) { skipped.push({ ...ind, reason: 'over 18T air cap, move to ship' }); continue; }
      airKg += kg;
    }
    packed.push({ ...ind, skuName: sku.name, totalKg: kg, totalM3: m3, hazmatSeparate: !!sku.hazmat });
  }
  const shipKg = packed.filter((p) => p.lane === 'ship').reduce((a, p) => a + p.totalKg, 0);
  const offloadOrder = packed.slice().sort((a, b) => a.priority - b.priority || (b.hazmatSeparate ? -1 : 0)).map((p, i) => ({ order: i + 1, indentId: p.id, skuName: p.skuName }));
  res.json({ lane, packed, skipped, totals: { airKg, shipKg, airCapKg: AIR_CAP }, offloadOrder });
});

app.get('/api/stock', (req, res) => res.json(stockWithCover(req.query.stationId || null)));

app.post('/api/stock/issue', (req, res) => {
  const { stationId, skuId, qty } = req.body;
  const row = stock.find((s) => s.stationId === stationId && s.skuId === skuId);
  if (!row) return res.status(404).json({ error: 'stock row not found' });
  const q = Number(qty);
  if (!Number.isFinite(q) || q === 0) return res.status(400).json({ error: 'qty must be non-zero' });
  row.qty = Math.max(0, row.qty - q); // issue positive qty reduces stock; negative qty = return
  res.json({ ok: true, row: stockWithCover(stationId).find((s) => s.skuId === skuId) });
});

app.get('/api/people', (req, res) => res.json(people));

// Muster compressor simulation: bitfield + header must stay under 340B
app.post('/api/muster', (req, res) => {
  const { stationId, presentIds } = req.body;
  const stationPeople = people.filter((p) => p.stationId === stationId);
  const present = new Set(presentIds || []);
  const missing = stationPeople.filter((p) => !present.has(p.id)).map((p) => p.id);
  const bytes = 8 + Math.ceil(stationPeople.length / 8); // header + bitfield
  const ev = {
    id: 'mu' + (++idCounter),
    stationId,
    at: new Date().toISOString(),
    total: stationPeople.length,
    present: stationPeople.length - missing.length,
    missing,
    bytes,
    fitsSBD: bytes <= 340
  };
  musters.push(ev);
  res.json(ev);
});
app.get('/api/musters', (req, res) => res.json(musters.slice().reverse()));

app.get('/api/incidents', (req, res) => res.json(incidents));
app.post('/api/incidents', (req, res) => {
  const { stationId, type, detail, severity } = req.body;
  if (!stationId || !type) return res.status(400).json({ error: 'stationId and type required' });
  const inc = {
    id: 'in' + (++idCounter),
    stationId, type,
    detail: detail || type,
    severity: severity || 'medium',
    status: 'open', step: 1,
    at: new Date().toISOString(),
    sbdSent: false
  };
  incidents.unshift(inc);
  res.json(inc);
});
app.post('/api/incidents/:id/advance', (req, res) => {
  const inc = incidents.find((i) => i.id === req.params.id);
  if (!inc) return res.status(404).json({ error: 'not found' });
  const steps = (playbooks[inc.type] || []).length || 4;
  inc.step = Math.min(steps, inc.step + 1);
  if (inc.step >= steps) inc.status = 'monitoring';
  res.json(inc);
});
app.post('/api/incidents/:id/sbd', (req, res) => {
  const inc = incidents.find((i) => i.id === req.params.id);
  if (!inc) return res.status(404).json({ error: 'not found' });
  inc.sbdSent = true; // 340B burst simulator
  res.json({ ok: true, bytes: 120, latencySec: '5-20', incident: inc });
});

function eiesXML() {
  const rows = stockWithCover(null).map((s) => `    <stock station="${s.stationName}" sku="${s.skuName}" qty="${s.qty}" daysOfCover="${s.daysOfCover}" winterOk="${s.winterOk}"/>`).join('\n');
  return `<?xml version="1.0"?>\n<EIES preSeasonDue="1-Oct">\n  <expedition name="43-ISEA demo" vessel="MV Vasiliy Golovnin" aircraft="IL-76 18T"/>\n  <stations>\n    <station name="Maitri" berths="25"/>\n    <station name="Bharati" berths="47"/>\n    <station name="Himadri" berths="8"/>\n  </stations>\n${rows}\n  <fuel jetA1BarrelsPerYear="600"/>\n</EIES>`;
}

app.get('/api/compliance/eies', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.send(eiesXML());
});
app.get('/api/compliance/dgshipping', (req, res) => {
  const csv = 'station,sku,qty,days_of_cover,winter_ok\n' + stockWithCover(null).map((s) => `${s.stationName},${s.skuName},${s.qty},${s.daysOfCover},${s.winterOk}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});
app.get('/api/sync/status', (req, res) => {
  res.json({ mode: 'prototype-online', pendingBytes: 0, lastSync: new Date().toISOString(), queue: { muster: 0, manifest: scanEvents.length, bulk: 0 }, note: 'Offline-first CRDT + resumable sync ships after prototype. Core REST works now.' });
});

app.get('/', (req, res) => res.json({ ok: true, name: 'POLARIS backend prototype', docs: ['/api/health', '/api/overview', '/api/crates', '/api/stock', '/api/people', '/api/incidents', '/api/compliance/eies'] }));

app.listen(PORT, () => console.log(`POLARIS backend on :${PORT}`));
