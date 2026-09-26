import { useEffect, useMemo, useState } from 'react';
import {
  ConfigProvider, Layout, Tabs, Card, Row, Col, Statistic, Table, Tag, Button,
  Modal, Form, Input, InputNumber, Select, Timeline, Alert, Progress, Space, Divider
} from 'antd';
import {
  DashboardOutlined, ContainerOutlined, ShoppingOutlined, TeamOutlined,
  AlertOutlined, FileTextOutlined, RocketOutlined, PlusOutlined, ScanOutlined
} from '@ant-design/icons';
import './App.css';
import { api, hasBackend } from './api.js';
import { stations, skus, crates as seedCrates, people as seedPeople, LEGS, DAYS_UNTIL_DEC } from './data/seed.js';

const { Header, Content } = Layout;

const localIndentsSeed = [
  { id: 'ind1', institute: 'NCPOR', skuId: 'jeta1', qty: 600, priority: 1, lane: 'ship', status: 'approved' },
  { id: 'ind2', institute: 'IMD', skuId: 'baa', qty: 200, priority: 2, lane: 'ship', status: 'approved' },
  { id: 'ind3', institute: 'ISRO', skuId: 'modem', qty: 4, priority: 1, lane: 'air', status: 'approved' },
  { id: 'ind4', institute: 'AIIMS-logistics', skuId: 'para', qty: 800, priority: 1, lane: 'air', status: 'approved' },
  { id: 'ind6', institute: 'NIO', skuId: 'cryo', qty: 40, priority: 2, lane: 'air', status: 'approved' },
  { id: 'ind9', institute: 'CMLRE', skuId: 'rice', qty: 300, priority: 2, lane: 'ship', status: 'approved' }
];

const localStockSeed = [
  { stationId: 'maitri', skuId: 'jeta1', qty: 320 },
  { stationId: 'maitri', skuId: 'rice', qty: 400 },
  { stationId: 'maitri', skuId: 'para', qty: 500 },
  { stationId: 'maitri', skuId: 'amox', qty: 120 },
  { stationId: 'maitri', skuId: 'baa', qty: 150 },
  { stationId: 'bharati', skuId: 'jeta1', qty: 280 },
  { stationId: 'bharati', skuId: 'rice', qty: 500 },
  { stationId: 'bharati', skuId: 'cryo', qty: 20 },
  { stationId: 'bharati', skuId: 'dfilter', qty: 30 },
  { stationId: 'himadri', skuId: 'para', qty: 100 },
  { stationId: 'himadri', skuId: 'baa', qty: 60 },
  { stationId: 'himadri', skuId: 'tent', qty: 8 }
];

const skuName = (id) => skus.find((s) => s.id === id)?.name || id;
const stName = (id) => stations.find((s) => s.id === id)?.name || id || '-';
const withCover = (rows) => rows.map((r) => {
  const sku = skus.find((s) => s.id === r.skuId);
  const doc = sku.perDay > 0 ? Math.floor(r.qty / sku.perDay) : 9999;
  return { ...r, key: r.stationId + r.skuId, skuName: sku.name, perDay: sku.perDay, daysOfCover: doc, winterOk: doc >= DAYS_UNTIL_DEC };
});

const legColor = { Goa: 'blue', Mumbai: 'orange', 'Cape Town': 'purple', Vessel: 'cyan', Offload: 'gold', Station: 'green' };

export default function App() {
  const [backendOn, setBackendOn] = useState(false);
  const [crates, setCrates] = useState(seedCrates);
  const [events, setEvents] = useState([
    { id: 'se1', crateId: 'CR-101', leg: 'Mumbai', at: '2022-10-22', actor: 'Mumbai port', note: 'Lot 1 sailed' },
    { id: 'se2', crateId: 'CR-103', leg: 'Cape Town', at: '2022-11-25', actor: 'Cape Town', note: 'Lot 2 sailed' }
  ]);
  const [indents, setIndents] = useState(localIndentsSeed);
  const [stockRows, setStockRows] = useState(localStockSeed);
  const [people, setPeople] = useState(seedPeople);
  const [incidents, setIncidents] = useState([
    { id: 'in1', stationId: 'bharati', type: 'fire', severity: 'high', status: 'open', step: 1, detail: 'Fuel store smoke alarm', sbdSent: false },
    { id: 'in2', stationId: 'maitri', type: 'medevac', severity: 'medium', status: 'monitoring', step: 2, detail: 'Ankle injury triage', sbdSent: true }
  ]);
  const [plan, setPlan] = useState(null);
  const [lane, setLane] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [musterStation, setMusterStation] = useState('maitri');
  const [musterResult, setMusterResult] = useState(null);
  const [eies, setEies] = useState('');
  const [modal, setModal] = useState(null); // indent | crate | person | incident | stock
  const [form] = Form.useForm();

  const refresh = async () => {
    if (!hasBackend()) return;
    try {
      await api.req('/api/health');
      setBackendOn(true);
      const [c, e, s, p, inc, ind] = await Promise.all([
        api.req('/api/crates'), api.req('/api/scan-events'), api.req('/api/stock'),
        api.req('/api/people'), api.req('/api/incidents'), api.req('/api/indents').catch(() => null)
      ]);
      setCrates(c); setEvents(e);
      setStockRows(s.map((r) => ({ stationId: r.stationId, skuId: r.skuId, qty: r.qty })));
      setPeople(p); setIncidents(inc);
      if (ind) setIndents(ind);
    } catch { setBackendOn(false); }
  };
  useEffect(() => { refresh(); }, []);

  const stockView = useMemo(() =>
    withCover(stockRows).filter((r) => stationFilter === 'all' || r.stationId === stationFilter),
    [stockRows, stationFilter]);

  async function runPlanner() {
    if (backendOn) {
      setPlan(await api.req('/api/planner/run', { method: 'POST', body: JSON.stringify({ lane }) }));
      return;
    }
    const list = indents.filter((i) => lane === 'all' || i.lane === lane).sort((a, b) => a.priority - b.priority);
    let airKg = 0; const packed = []; const skipped = [];
    for (const ind of list) {
      const sku = skus.find((s) => s.id === ind.skuId);
      const kg = sku.weightKg * ind.qty;
      if (ind.lane === 'air' && airKg + kg > 18000) { skipped.push({ ...ind, reason: 'over 18T air cap' }); continue; }
      if (ind.lane === 'air') airKg += kg;
      packed.push({ ...ind, skuName: sku.name, totalKg: kg });
    }
    setPlan({ lane, packed, skipped, totals: { airKg, airCapKg: 18000 }, offloadOrder: packed.map((p, i) => ({ order: i + 1, skuName: p.skuName })) });
  }

  async function submitModal(values) {
    if (modal === 'indent') {
      if (backendOn) { const r = await api.req('/api/indents', { method: 'POST', body: JSON.stringify(values) }); setIndents((p) => [...p, r]); }
      else setIndents((p) => [...p, { ...values, id: 'ind' + Date.now(), status: 'pending', hazmat: !!skus.find((s) => s.id === values.skuId)?.hazmat }]);
    }
    if (modal === 'crate') {
      if (backendOn) { const r = await api.req('/api/crates', { method: 'POST', body: JSON.stringify(values) }); setCrates(await api.req('/api/crates')); setEvents(await api.req('/api/scan-events')); }
      else {
        const n = crates.length + 101;
        setCrates((p) => [...p, { id: 'CR-' + n, skuName: skuName(values.skuId), skuId: values.skuId, qty: values.qty, leg: 'Goa', status: 'packed', lane: values.lane }]);
        setEvents((p) => [{ id: 'se' + Date.now(), crateId: 'CR-' + n, leg: 'Goa', at: new Date().toISOString().slice(0, 10), actor: 'NCPOR Goa', note: 'packed' }, ...p]);
      }
    }
    if (modal === 'person') {
      if (backendOn) { const r = await api.req('/api/people', { method: 'POST', body: JSON.stringify(values) }); setPeople((p) => [...p, r]); }
      else setPeople((p) => [...p, { ...values, id: 'p' + Date.now(), medical: 'pending', medicalFlag: false, training: 'pending', allowancePerDay: 0 }]);
    }
    if (modal === 'incident') {
      if (backendOn) { const r = await api.req('/api/incidents', { method: 'POST', body: JSON.stringify(values) }); setIncidents((p) => [r, ...p]); }
      else setIncidents((p) => [{ ...values, id: 'in' + Date.now(), status: 'open', step: 1, sbdSent: false }, ...p]);
    }
    if (modal === 'stock') {
      if (backendOn) { await api.req('/api/stock/add', { method: 'POST', body: JSON.stringify(values) }); const rows = await api.req('/api/stock'); setStockRows(rows.map((r) => ({ stationId: r.stationId, skuId: r.skuId, qty: r.qty }))); }
      else setStockRows((p) => {
        const ex = p.find((r) => r.stationId === values.stationId && r.skuId === values.skuId);
        if (ex) return p.map((r) => (r === ex ? { ...r, qty: r.qty + Number(values.qty) } : r));
        return [...p, { stationId: values.stationId, skuId: values.skuId, qty: Number(values.qty) }];
      });
    }
    setModal(null); form.resetFields();
  }

  async function doScan(crateId, leg) {
    if (backendOn) {
      await api.req('/api/scan', { method: 'POST', body: JSON.stringify({ crateId, leg, actor: 'Web prototype' }) });
      setCrates(await api.req('/api/crates')); setEvents(await api.req('/api/scan-events'));
    } else {
      setCrates((p) => p.map((c) => (c.id === crateId ? { ...c, leg, status: leg === 'Station' ? 'delivered' : 'in-transit' } : c)));
      setEvents((p) => [{ id: 'se' + Date.now(), crateId, leg, at: new Date().toISOString().slice(0, 10), actor: 'Web prototype', note: 'scan' }, ...p]);
    }
  }

  async function doMuster() {
    const list = people.filter((p) => p.stationId === musterStation);
    if (backendOn) {
      setMusterResult(await api.req('/api/muster', { method: 'POST', body: JSON.stringify({ stationId: musterStation, presentIds: list.map((p) => p.id) }) }));
    } else {
      const bytes = 8 + Math.ceil(list.length / 8);
      setMusterResult({ stationId: musterStation, total: list.length, present: list.length, missing: [], bytes, fitsSBD: bytes <= 340 });
    }
  }

  async function loadEies() {
    if (backendOn) { setEies(await api.req('/api/compliance/eies')); return; }
    setEies(`<EIES preSeasonDue="1-Oct">\n${withCover(stockRows).map((s) => `  <stock station="${s.stationId}" sku="${s.skuName}" qty="${s.qty}" days="${s.daysOfCover}" winterOk="${s.winterOk}"/>`).join('\n')}\n  <fuel jetA1BarrelsPerYear="600"/>\n</EIES>`);
  }

  const items = [
    {
      key: 'dashboard', label: <span><DashboardOutlined /> Dashboard</span>, children: (
        <>
          <Row gutter={12}>
            <Col xs={12} md={6}><Card><Statistic title="Trip cost" value="Rs 200M" /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Voyage" value="12000 nm / 94d" /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Crates tracked" value={crates.length} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Open incidents" value={incidents.filter((i) => i.status === 'open').length} /></Card></Col>
          </Row>
          <Row gutter={12} style={{ marginTop: 12 }}>
            {stations.map((s) => (
              <Col xs={24} md={8} key={s.id}><Card title={s.name} extra={<Tag>{s.berths} berths</Tag>}>
                <div style={{ color: '#5b7288', fontSize: 13 }}>{s.note}</div>
                <div style={{ marginTop: 8 }}>Stock lines: {stockRows.filter((r) => r.stationId === s.id).length} · People: {people.filter((p) => p.stationId === s.id).length}</div>
              </Card></Col>
            ))}
          </Row>
          <Card title="Supply route" style={{ marginTop: 12 }}>
            <div className="route">{['NCPOR Goa', 'Mumbai', 'Cape Town / DROMLAN', 'Vessel / IL-76 18T', 'Maitri', 'Bharati 3000km', 'Himadri'].map((s, i, a) => (
              <span key={s}><span className="dot" /> {s}{i < a.length - 1 ? ' → ' : ''}</span>))}</div>
            <Alert style={{ marginTop: 10 }} type="info" showIcon message="IL-76 2 Oct 2025 carried 18T Mopa to Troll and saved ~40 days at sea. 42-ISEA lots: dispatched 15 Oct, sailed 22 Oct, lot 2 mobilised 14 Nov, sailed 25 Nov." />
          </Card>
        </>
      )
    },
    {
      key: 'planner', label: <span><ShoppingOutlined /> Planner</span>, children: (
        <Card title="Season indents (70+ institutes, demo subset)" extra={<Space>
          <Select value={lane} onChange={setLane} options={[{ value: 'all', label: 'Ship + Air' }, { value: 'ship', label: 'Ship' }, { value: 'air', label: 'Air 18T' }]} />
          <Button type="primary" onClick={runPlanner}>Run pack</Button>
          <Button icon={<PlusOutlined />} onClick={() => setModal('indent')}>Add indent</Button>
        </Space>}>
          <Table size="small" dataSource={indents} rowKey="id" pagination={false}
            columns={[
              { title: 'Institute', dataIndex: 'institute' },
              { title: 'Item', render: (_, r) => skuName(r.skuId) },
              { title: 'Qty', dataIndex: 'qty' },
              { title: 'Pri', dataIndex: 'priority' },
              { title: 'Lane', dataIndex: 'lane', render: (v) => <Tag color={v === 'air' ? 'blue' : 'default'}>{v}</Tag> },
              { title: 'Status', dataIndex: 'status' }
            ]} />
          {plan && <><Divider />Found pack: air {plan.totals.airKg}/{plan.totals.airCapKg} kg.
            <Table size="small" dataSource={plan.offloadOrder} rowKey="order" pagination={false}
              columns={[{ title: '#', dataIndex: 'order' }, { title: 'Item', dataIndex: 'skuName' }]} />
            {plan.skipped?.length > 0 && <Alert type="warning" showIcon message={'Over air cap: ' + plan.skipped.map((s) => s.id).join(', ')} />}</>}
        </Card>
      )
    },
    {
      key: 'cargo', label: <span><ContainerOutlined /> Cargo</span>, children: (
        <>
          <Card title="Crates" extra={<Button icon={<PlusOutlined />} onClick={() => setModal('crate')}>Add crate</Button>}>
            <Table size="small" dataSource={crates} rowKey="id" pagination={{ pageSize: 8 }}
              columns={[
                { title: 'Crate', dataIndex: 'id' },
                { title: 'Item', dataIndex: 'skuName' },
                { title: 'Qty', dataIndex: 'qty' },
                { title: 'Leg', dataIndex: 'leg', render: (v) => <Tag color={legColor[v] || 'default'}>{v}</Tag> },
                { title: 'Lane', dataIndex: 'lane' },
                { title: 'Act', render: (_, r) => <Space>{LEGS.map((l) => <Button key={l} size="small" onClick={() => doScan(r.id, l)}>{l}</Button>)}</Space> }
              ]} />
          </Card>
          <Card title="Custody timeline" style={{ marginTop: 12 }}>
            <Timeline items={events.slice(0, 10).map((e) => ({ children: `${e.at} — ${e.crateId} at ${e.leg} (${e.actor})` }))} />
          </Card>
        </>
      )
    },
    {
      key: 'stock', label: <span><ScanOutlined /> Stock</span>, children: (
        <Card title={`Winter stock (need ${DAYS_UNTIL_DEC} days cover)`} extra={<Space>
          <Select value={stationFilter} onChange={setStationFilter} style={{ width: 160 }}
            options={[{ value: 'all', label: 'All stations' }, ...stations.map((s) => ({ value: s.id, label: s.name }))]} />
          <Button icon={<PlusOutlined />} onClick={() => setModal('stock')}>Add stock</Button>
        </Space>}>
          <Table size="small" dataSource={stockView} rowKey="key" pagination={false}
            columns={[
              { title: 'Station', render: (_, r) => stName(r.stationId) },
              { title: 'Item', dataIndex: 'skuName' },
              { title: 'Qty', dataIndex: 'qty' },
              { title: 'Days', dataIndex: 'daysOfCover', render: (v) => <Progress percent={Math.min(100, Math.round((v / DAYS_UNTIL_DEC) * 100))} size="small" format={() => v} /> },
              { title: 'Winter', render: (_, r) => r.winterOk ? <Tag color="green">safe</Tag> : <Tag color="red">short</Tag> }
            ]} />
        </Card>
      )
    },
    {
      key: 'people', label: <span><TeamOutlined /> People</span>, children: (
        <>
          <Card title="Personnel (Rs 1500 summer / Rs 2000 winter)" extra={<Button icon={<PlusOutlined />} onClick={() => setModal('person')}>Add person</Button>}>
            <Table size="small" dataSource={people} rowKey="id" pagination={false}
              columns={[
                { title: 'Name', dataIndex: 'name' },
                { title: 'Role', dataIndex: 'role' },
                { title: 'Station', render: (_, r) => stName(r.stationId) },
                { title: 'Stage', dataIndex: 'stage', render: (v) => <Tag>{v}</Tag> },
                { title: 'Rs/day', dataIndex: 'allowancePerDay' },
                { title: 'Medical', render: (_, r) => r.medicalFlag ? <Tag color="orange">flag</Tag> : <Tag color="green">{r.medical}</Tag> }
              ]} />
          </Card>
          <Card title="One-tap muster (340B SBD)" style={{ marginTop: 12 }}>
            <Space>
              <Select value={musterStation} onChange={setMusterStation} style={{ width: 160 }}
                options={stations.map((s) => ({ value: s.id, label: s.name }))} />
              <Button type="primary" onClick={doMuster}>Run muster</Button>
            </Space>
            {musterResult && <Alert style={{ marginTop: 10 }} type={musterResult.fitsSBD ? 'success' : 'error'} showIcon
              message={`${musterResult.present}/${musterResult.total} present, ${musterResult.bytes} bytes — ${musterResult.fitsSBD ? 'fits SBD burst, 5-20 sec' : 'too big'}`} />}
          </Card>
        </>
      )
    },
    {
      key: 'emergency', label: <span><AlertOutlined /> Emergency</span>, children: (
        <Card title="Incidents" extra={<Button icon={<PlusOutlined />} onClick={() => setModal('incident')}>Report incident</Button>}>
          <Table size="small" dataSource={incidents} rowKey="id" pagination={false}
            columns={[
              { title: 'Station', render: (_, r) => stName(r.stationId) },
              { title: 'Type', dataIndex: 'type', render: (v) => <Tag color="red">{v}</Tag> },
              { title: 'Detail', dataIndex: 'detail' },
              { title: 'Status', dataIndex: 'status' },
              { title: 'SBD', render: (_, r) => (r.sbdSent ? <Tag color="green">sent</Tag> : <Tag>no</Tag>) }
            ]} />
          <Alert style={{ marginTop: 10 }} type="info" showIcon message="Playbooks: fire, crevasse, medevac, fuel spill. A single medevac costs over $150,000. Station fires: 8 Mirny 1960, 2 Ferraz 2012." />
        </Card>
      )
    },
    {
      key: 'compliance', label: <span><FileTextOutlined /> Compliance</span>, children: (
        <Card title="EIES pre-season due 1 Oct + DG-Shipping (Antarctic Act to Rs 50 cr)" extra={<Button type="primary" onClick={async () => {
          if (backendOn) { setEies(await api.req('/api/compliance/eies')); }
          else {
            const rows = withCover(stockRows).map((s) => `  <stock station="${s.stationId}" sku="${s.skuName}" qty="${s.qty}" days="${s.daysOfCover}"/>`).join('\n');
            setEies(`<EIES preSeasonDue="1-Oct">\n${rows}\n  <fuel jetA1BarrelsPerYear="600"/>\n</EIES>`);
          }
        }}>Generate EIES XML</Button>}>
          {eies ? <pre className="xml">{eies}</pre> : <div style={{ color: '#5b7288' }}>One click from live stock, fuel and people data. No season-end scramble.</div>}
        </Card>
      )
    },
    {
      key: 'future', label: <span><RocketOutlined /> Future Scope</span>, children: (
        <Row gutter={12}>
          <Col xs={24} md={12}><Card title="Offline-first data">Local SQLite + CRDT (Automerge/Yjs) per node, delta sync over HTTP/3 with resume, priority queue muster first. Survives 40 kbps, 10% loss, 15-sec cuts.</Card></Col>
          <Col xs={24} md={12}><Card title="Maps + auth on-prem">MapLibre self-hosted polar tiles (Google fails at 69S). Keycloak OIDC, Docker, MeghRaj-ready. GPS+GLONASS+Galileo — NavIC stops at 30S.</Card></Col>
          <Col xs={24} md={12}><Card title="Smart forecast" style={{ marginTop: 12 }}>Per-SKU SARIMAX + XGBoost on station server. Monte Carlo winter simulator. Target 30-50% error cut, 65% fewer stockouts.</Card></Col>
          <Col xs={24} md={12}><Card title="Field hardware" style={{ marginTop: 12 }}>Passive UHF RFID EPC Gen2 (-40C, no battery) + GS1 QR fallback. BLE loggers + LoRaWAN gateway. Iridium 9603 SBD field test + PLB link.</Card></Col>
          <Col xs={24} md={12}><Card title="Adoption" style={{ marginTop: 12 }}>Scan-first UX, Hindi/regional UI, taught inside ITBP Auli training. Signed QR links for DROMLAN partners + email/CSV ingest.</Card></Col>
          <Col xs={24} md={12}><Card title="Scale" style={{ marginTop: 12 }}>Same core for Himadri Arctic, Maitri-II (Rs 2000 cr, 90 people, 2032), new Polar Research Vessel (GRSE-Kongsberg), Himalayan camps, Deep Ocean Mission.</Card></Col>
        </Row>
      )
    }
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#0e7c9e', borderRadius: 10, fontFamily: 'system-ui' } }}>
      <Layout style={{ minHeight: '100vh', background: '#f6f8fb' }}>
        <Header style={{ background: '#12395b', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: 1 }}>POLARIS</span>
          <Tag color="cyan">PS 26062 prototype</Tag>
          <span style={{ color: '#c9dcea', fontSize: 12 }}>{backendOn ? 'Backend connected' : 'Local demo mode — set VITE_API_URL for Render'}</span>
        </Header>
        <Content style={{ maxWidth: 1180, margin: '0 auto', padding: 16, width: '100%' }}>
          <Tabs items={items} type="card" />
        </Content>
      </Layout>

      <Modal open={!!modal} title={'Add ' + modal} onCancel={() => { setModal(null); form.resetFields(); }} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submitModal}>
          {modal === 'indent' && <>
            <Form.Item name="institute" label="Institute" rules={[{ required: true }]}><Select options={['NCPOR', 'IMD', 'ISRO', 'AIIMS-logistics', 'IITM', 'NIO', 'WIHG', 'CMLRE'].map((v) => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="skuId" label="Item" rules={[{ required: true }]}><Select options={skus.map((s) => ({ value: s.id, label: s.name }))} /></Form.Item>
            <Form.Item name="qty" label="Qty" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="priority" label="Priority (1 urgent)"><InputNumber min={1} max={3} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="lane" label="Lane"><Select options={[{ value: 'ship', label: 'Ship' }, { value: 'air', label: 'Air 18T' }]} /></Form.Item>
          </>}
          {modal === 'crate' && <>
            <Form.Item name="skuId" label="Item" rules={[{ required: true }]}><Select options={skus.map((s) => ({ value: s.id, label: s.name }))} /></Form.Item>
            <Form.Item name="qty" label="Qty" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="lane" label="Lane"><Select options={[{ value: 'ship', label: 'Ship' }, { value: 'air', label: 'Air' }]} /></Form.Item>
          </>}
          {modal === 'person' && <>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}><Input placeholder="Technician / Doctor / Logistics" /></Form.Item>
            <Form.Item name="stationId" label="Station"><Select allowClear options={stations.map((s) => ({ value: s.id, label: s.name }))} /></Form.Item>
            <Form.Item name="stage" label="Stage"><Select options={['application', 'medical', 'training', 'transit', 'berth', 'station'].map((v) => ({ value: v, label: v }))} /></Form.Item>
          </>}
          {modal === 'incident' && <>
            <Form.Item name="stationId" label="Station" rules={[{ required: true }]}><Select options={stations.map((s) => ({ value: s.id, label: s.name }))} /></Form.Item>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}><Select options={['fire', 'crevasse', 'medevac', 'fuel_spill'].map((v) => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="detail" label="Detail"><Input /></Form.Item>
            <Form.Item name="severity" label="Severity"><Select options={['low', 'medium', 'high'].map((v) => ({ value: v, label: v }))} /></Form.Item>
          </>}
          {modal === 'stock' && <>
            <Form.Item name="stationId" label="Station" rules={[{ required: true }]}><Select options={stations.map((s) => ({ value: s.id, label: s.name }))} /></Form.Item>
            <Form.Item name="skuId" label="Item" rules={[{ required: true }]}><Select options={skus.map((s) => ({ value: s.id, label: s.name }))} /></Form.Item>
            <Form.Item name="qty" label="Add qty" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          </>}
        </Form>
      </Modal>
    </ConfigProvider>
  );
}
