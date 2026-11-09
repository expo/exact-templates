// The store's API: `bun server.ts` (bun:sqlite). It listens where app.ts's API names it; `test` and `verify` run it
// themselves on an empty database, its path in DB. It holds what a static site cannot: live stock per size, who
// joined the list, accounts and orders. No payment is taken and nothing ships: an order is a record with a number.
import { Database } from 'bun:sqlite';
import { API } from './app.ts';
import { CATALOG } from './catalog.ts';

const db = new Database(process.env.DB ?? 'data.db');
db.run('CREATE TABLE IF NOT EXISTS stock (slug TEXT NOT NULL, size TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY (slug, size))');
db.run('CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, code TEXT NOT NULL, at TEXT NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS accounts (email TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL, since TEXT NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, email TEXT NOT NULL, at TEXT NOT NULL, body TEXT NOT NULL)');
db.run('CREATE TABLE IF NOT EXISTS restock (email TEXT NOT NULL, slug TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY (email, slug))');

// Stock is seeded from the catalog, the same on every empty database: a few sizes sold out, some down to the
// last few, so the product page has something live to say. An order takes from it.
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const seeded = (slug: string, size: string) => { const h = hash(`${slug}/${size}`) % 100; return h < 8 ? 0 : h < 28 ? 1 + (h % 3) : 6 + (h % 30); };
const seedStock = db.transaction(() => {
  const insert = db.query('INSERT OR IGNORE INTO stock (slug, size, count) VALUES (?, ?, ?)');
  for (const p of CATALOG) for (const size of p.sizes) insert.run(p.slug, size, seeded(p.slug, size));
});
seedStock();

// The store's codes, and every member's own FRIEND code (10%, as often as they like).
const CODES: Record<string, number> = { WELCOME15: 15, FLEECE10: 10 };
const pctOf = (code: string) => code in CODES ? CODES[code]! : db.query('SELECT 1 FROM accounts WHERE code = ?').get(code) !== null ? 10 : 0;
const FREE_SHIPPING_FROM = 7500, STANDARD = 600, EXPRESS = 1400;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET, POST, PATCH' };
const send = (body: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(body, { status, headers: { ...CORS, ...headers } });
const preflight = () => new Response(null, { status: 204, headers: CORS });
// JSON can be null, an array or a scalar even when parsing succeeds.
const readBody = async (req: Request): Promise<Record<string, unknown> | null> => {
  const body: unknown = await req.json().catch(() => null);
  return body !== null && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null;
};
const email = (v: unknown) => (typeof v === 'string' && EMAIL.test(v.trim()) ? v.trim().toLowerCase() : '');
const now = () => new Date().toISOString();

type Line = { slug: string; name: string; color: string; size: string; qty: number; priceCents: number };
type Order = { found: boolean; id: string; email: string; name: string; placedAt: string; status: string; shipping: string;
  subtotalCents: number; discountCents: number; shippingCents: number; totalCents: number; lines: Line[] };
const NO_ORDER: Order = { found: false, id: '', email: '', name: '', placedAt: '', status: '', shipping: '', subtotalCents: 0, discountCents: 0, shippingCents: 0, totalCents: 0, lines: [] };

const stockOf = (slug: string) => (db.query('SELECT size, count FROM stock WHERE slug = ?').all(slug) as { size: string; count: number }[]);
const account = (addr: string) => {
  const row = db.query('SELECT email, name, code, since FROM accounts WHERE email = ?').get(addr) as { email: string; name: string; code: string; since: string } | null;
  if (!row) return null;
  const subscribed = db.query('SELECT 1 FROM subscribers WHERE email = ?').get(addr) !== null;
  return { ok: true, error: '', email: row.email, name: row.name, code: row.code, memberSince: row.since, subscribed };
};
const orderRow = (row: { id: string; body: string } | null): Order => (row ? { ...NO_ORDER, ...(JSON.parse(row.body) as Partial<Order>), found: true, id: row.id } : NO_ORDER);
const personalCode = (addr: string) => `FRIEND${(hash(addr) % 9000 + 1000)}`;

// A line the app sends is its bag's own encoding, `slug|color|size|qty`.
function parseLines(lines: unknown): Line[] | string {
  if (!Array.isArray(lines) || lines.length === 0) return 'Your bag is empty.';
  const out: Line[] = [];
  for (const raw of lines) {
    if (typeof raw !== 'string') return 'A line in the bag is not readable.';
    const [slug, color, size, qtyText] = raw.split('|');
    const product = CATALOG.find((p) => p.slug === slug), qty = Number(qtyText);
    if (!product) return `There is no product called ${slug}.`;
    if (!product.sizes.includes(size ?? '')) return `${product.name} doesn't come in size ${size}.`;
    if (!product.colors.some((c) => c.name === color)) return `${product.name} doesn't come in ${color}.`;
    if (!Number.isSafeInteger(qty) || qty < 1 || qty > 10) return `Choose 1 to 10 of ${product.name}.`;
    out.push({ slug: product.slug, name: product.name, color: color!, size: size!, qty, priceCents: product.priceCents });
  }
  return out;
}

const { hostname, port } = new URL(API);
Bun.serve({ hostname, port: Number(port), routes: {
  '/health': () => new Response('ok'),
  '/stock/:slug': {
    OPTIONS: preflight,
    // Fresh for 15 seconds: `serve` renders a product page again only after that, and the browser likewise.
    GET: (req) => {
      const sizes = stockOf(req.params.slug);
      return sizes.length ? send({ slug: req.params.slug, sizes }, 200, { 'cache-control': 'max-age=15' }) : send({ error: 'No such product.' }, 404);
    },
  },
  // What is left of each line in a bag: `slug|colour|size` keys in, a count per key out.
  '/stock/check': {
    OPTIONS: preflight,
    POST: async (req) => {
      const body = await readBody(req);
      if (!body) return send({ error: 'Send a JSON object.' }, 400);
      const keys = Array.isArray(body.keys) ? body.keys.filter((k): k is string => typeof k === 'string').slice(0, 50) : [];
      return send(keys.map((key) => {
        const [slug, , size] = key.split('|');
        const row = db.query('SELECT count FROM stock WHERE slug = ? AND size = ?').get(slug ?? '', size ?? '') as { count: number } | null;
        return { key, count: row?.count ?? 0 };
      }));
    },
  },
  // A promo code's worth: 0 for one we don't know, so the bag can say so before the order.
  '/promo/:code': {
    OPTIONS: preflight,
    GET: (req) => {
      const code = decodeURIComponent(req.params.code).trim().toUpperCase();
      return send({ code, pct: pctOf(code) });
    },
  },
  // "Tell me when it's back": an address against a style, kept once.
  '/notify': {
    OPTIONS: preflight,
    POST: async (req) => {
      const body = await readBody(req);
      if (!body) return send({ error: 'Send a JSON object.' }, 400);
      const addr = email(body.email), slug = typeof body.slug === 'string' ? body.slug : '';
      if (!addr) return send({ ok: false, error: 'Enter an email address, like you@example.com.', slug }, 400);
      if (!CATALOG.some((p) => p.slug === slug)) return send({ ok: false, error: 'No such product.', slug }, 404);
      db.query('INSERT OR IGNORE INTO restock (email, slug, at) VALUES (?, ?, ?)').run(addr, slug, now());
      return send({ ok: true, error: '', slug }, 201);
    },
  },
  '/subscribe': {
    OPTIONS: preflight,
    POST: async (req) => {
      const body = await readBody(req);
      if (!body) return send({ error: 'Send a JSON object.' }, 400);
      const addr = email(body.email);
      if (!addr) return send({ ok: false, error: 'Enter an email address, like you@example.com.', code: '' }, 400);
      const known = db.query('SELECT code FROM subscribers WHERE email = ?').get(addr) as { code: string } | null;
      if (known) return send({ ok: true, error: '', code: known.code, returning: true });
      db.query('INSERT INTO subscribers (email, code, at) VALUES (?, ?, ?)').run(addr, 'WELCOME15', now());
      return send({ ok: true, error: '', code: 'WELCOME15', returning: false }, 201);
    },
  },
  '/signin': {
    OPTIONS: preflight,
    // No password: this demo signs in with an address alone and makes the account on first sight.
    POST: async (req) => {
      const body = await readBody(req);
      if (!body) return send({ error: 'Send a JSON object.' }, 400);
      const addr = email(body.email);
      if (!addr) return send({ ok: false, error: 'Enter an email address, like you@example.com.', email: '', name: '', code: '', memberSince: '', subscribed: false }, 400);
      if (!account(addr)) db.query('INSERT INTO accounts (email, name, code, since) VALUES (?, ?, ?, ?)').run(addr, '', personalCode(addr), now());
      return send(account(addr));
    },
  },
  '/account': {
    OPTIONS: preflight,
    GET: (req) => {
      const addr = email(new URL(req.url).searchParams.get('email'));
      const found = addr ? account(addr) : null;
      return found ? send(found) : send({ error: 'No such account.' }, 404);
    },
    PATCH: async (req) => {
      const body = await readBody(req);
      if (!body) return send({ error: 'Send a JSON object.' }, 400);
      const addr = email(body.email);
      if (!addr || !account(addr)) return send({ error: 'No such account.' }, 404);
      db.query('UPDATE accounts SET name = ? WHERE email = ?').run(typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '', addr);
      return send(account(addr));
    },
  },
  '/orders': {
    OPTIONS: preflight,
    GET: (req) => {
      const addr = email(new URL(req.url).searchParams.get('email'));
      const rows = addr ? (db.query('SELECT id, body FROM orders WHERE email = ? ORDER BY at DESC').all(addr) as { id: string; body: string }[]) : [];
      return send(rows.map(orderRow));
    },
    POST: async (req) => {
      const body = await readBody(req);
      if (!body) return send({ error: 'Send a JSON object.' }, 400);
      const addr = email(body.email);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const address = typeof body.address === 'string' ? body.address.trim() : '';
      const city = typeof body.city === 'string' ? body.city.trim() : '';
      const zip = typeof body.zip === 'string' ? body.zip.trim() : '';
      const shipping = body.shipping === 'express' ? 'express' : 'standard';
      const promo = typeof body.promo === 'string' ? body.promo.trim().toUpperCase() : '';
      if (!addr) return send({ ok: false, error: 'Enter an email address for the receipt.', id: '' }, 400);
      if (!name || !address || !city || !zip) return send({ ok: false, error: 'Fill in the name and address the order ships to.', id: '' }, 400);
      const lines = parseLines(body.lines);
      if (typeof lines === 'string') return send({ ok: false, error: lines, id: '' }, 400);
      const pct = promo ? pctOf(promo) : 0;
      if (promo && pct === 0) return send({ ok: false, error: `${promo} isn't a code we know.`, id: '' }, 400);
      // Colours share the stock row for a style and size. Check the combined demand,
      // including repeated lines, while holding the same transaction that consumes it.
      const demand = new Map<string, Line>();
      for (const l of lines) {
        const key = `${l.slug}|${l.size}`, previous = demand.get(key);
        demand.set(key, { ...l, qty: (previous?.qty ?? 0) + l.qty });
      }
      const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);
      const discountCents = Math.round(subtotalCents * pct / 100);
      const shippingCents = shipping === 'express' ? EXPRESS : subtotalCents - discountCents >= FREE_SHIPPING_FROM ? 0 : STANDARD;
      const place = db.transaction(() => {
        for (const l of demand.values()) {
          const left = (db.query('SELECT count FROM stock WHERE slug = ? AND size = ?').get(l.slug, l.size) as { count: number } | null)?.count ?? 0;
          if (left < l.qty) return { ok: false, error: left <= 0 ? `${l.name} in ${l.size} just sold out.` : `Only ${left} left of ${l.name} in ${l.size}.`, id: '' };
        }
        const id = `SW-${String(10000 + (db.query('SELECT count(*) AS n FROM orders').get() as { n: number }).n + 1)}`;
        const order: Order = { found: true, id, email: addr, name, placedAt: now(), status: 'confirmed', shipping, subtotalCents, discountCents, shippingCents, totalCents: subtotalCents - discountCents + shippingCents, lines };
        for (const l of demand.values()) db.query('UPDATE stock SET count = count - ? WHERE slug = ? AND size = ?').run(l.qty, l.slug, l.size);
        db.query('INSERT INTO orders (id, email, at, body) VALUES (?, ?, ?, ?)').run(id, addr, order.placedAt, JSON.stringify(order));
        if (!account(addr)) db.query('INSERT INTO accounts (email, name, code, since) VALUES (?, ?, ?, ?)').run(addr, name, personalCode(addr), now());
        return { ok: true, error: '', id };
      });
      const result = place.immediate();
      return send(result, result.ok ? 201 : 409);
    },
  },
  '/orders/:id': {
    OPTIONS: preflight,
    GET: (req) => {
      const row = db.query('SELECT id, body FROM orders WHERE id = ?').get(req.params.id) as { id: string; body: string } | null;
      return row ? send(orderRow(row)) : send({ error: 'No such order.' }, 404);
    },
  },
} });
console.log(`server.ts: ${API}`);
