// API layer: uses Render backend if VITE_API_URL is set, else local fallback.
// Prototype core only. Offline-first CRDT comes later.

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function req(path, opts) {
  if (!BASE) throw new Error('no-backend');
  const r = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!r.ok) throw new Error('api-' + r.status);
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('xml') || ct.includes('csv') || ct.includes('text')) return r.text();
  return r.json();
}

export const hasBackend = () => Boolean(BASE);
export const api = { req, base: BASE };
