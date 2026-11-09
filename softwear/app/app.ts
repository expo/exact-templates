import type { Answer, Result, Sources } from './app.contract.d.ts';
import { CATALOG } from './catalog.ts';

// The API's origin, a setting (app.json's "env"): the environment's value, else .env.local's, else .env's
// (server.ts). It is inlined into the module on every host, so it is public: never a secret.
export const API = import.meta.env.API_BASE_URL;
export const grants = `net.fetch ${API}`;

type Stock = Result<'loadStock'>;
type Account = Result<'loadAccount'>;
type Order = Result<'loadOrder'>;
type Line = Order['lines'][number];
type Joined = Result<'subscribe'>;
type Placed = Result<'placeOrder'>;
type Promo = Result<'checkPromo'>;
type LineStock = Result<'loadBagStock'>[number];
type Notified = Result<'notifyMe'>;

const NO_ACCOUNT: Account = { ok: false, error: '', email: '', name: '', code: '', memberSince: '', subscribed: false };
const NO_ORDER: Order = { found: false, id: '', email: '', name: '', placedAt: '', status: '', shipping: '', subtotalCents: 0, discountCents: 0, shippingCents: 0, totalCents: 0, lines: [] };

type Answered = { ok: true; status: number; body: unknown } | { ok: false; status: number; error: string };
// One call to the API: a reply with its JSON, or why it failed. At build there is no server (`bake`), which a
// source lets through so the page renders without that answer and asks again at launch.
async function call(path: string, init: RequestInit = {}): Promise<Answered> {
  try {
    const res = await fetch(`${API}${path}`, { ...init, exactTimeout: 10000, headers: { 'content-type': 'application/json' } });
    const body = (await res.json().catch(() => ({}))) as { error?: unknown };
    if (res.ok) return { ok: true, status: res.status, body };
    return { ok: false, status: res.status, error: typeof body?.error === 'string' ? body.error : `The store answered ${res.status}.` };
  } catch (e) {
    if ((e as { code?: string }).code === 'bake') throw e;
    return { ok: false, status: 0, error: 'Can’t reach the store right now. Try again in a moment.' };
  }
}
const post = (path: string, body: unknown) => call(path, { method: 'POST', body: JSON.stringify(body) });

const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object';
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const int = (v: unknown) => (typeof v === 'number' && Number.isSafeInteger(v) ? v : 0);

function toLine(v: unknown): Line | null {
  if (!isRecord(v)) return null;
  return { slug: str(v.slug), name: str(v.name), color: str(v.color), size: str(v.size), qty: int(v.qty), priceCents: int(v.priceCents) };
}
function toOrder(v: unknown): Order {
  if (!isRecord(v) || typeof v.id !== 'string') return NO_ORDER;
  const lines = Array.isArray(v.lines) ? v.lines.map(toLine).filter((l): l is Line => l !== null) : [];
  return { found: true, id: v.id, email: str(v.email), name: str(v.name), placedAt: str(v.placedAt), status: str(v.status), shipping: str(v.shipping),
    subtotalCents: int(v.subtotalCents), discountCents: int(v.discountCents), shippingCents: int(v.shippingCents), totalCents: int(v.totalCents), lines };
}
function toAccount(v: unknown, error = ''): Account {
  if (!isRecord(v) || typeof v.email !== 'string' || !v.email) return { ...NO_ACCOUNT, error };
  return { ok: true, error: '', email: v.email, name: str(v.name), code: str(v.code), memberSince: str(v.memberSince), subscribed: v.subscribed === true };
}

// Hermes (the iOS and Android apps) answers the app. Bun, which renders the site ahead and bakes every build's first
// frame, is told to ask at launch (`bake`), so the placeholder, the site, stands in what it renders. Anything else is a
// browser, which answers the site.
const BAKE = Object.assign(new Error('the host is known at launch'), { code: 'bake' });
const sources: Sources = {
  loadHost: async () => {
    const g = globalThis as { HermesInternal?: unknown; Bun?: unknown };
    if (typeof g.HermesInternal !== 'undefined') return { app: true };
    if (typeof g.Bun !== 'undefined') throw BAKE;
    return { app: false };
  },
  // The catalog is the site's own, so the pages that list it render at build.
  loadCatalog: async () => CATALOG,
  // What is left of each size, asked when a product page renders. A failed read fails the resource: the page then
  // shows every size and says nothing about stock. The server's answer keeps 15 s (`contract vocab cache`).
  loadStock: async ([slug]): Promise<Stock> => {
    if (!slug) return { slug: '', ready: false, sizes: [] };
    // A mutation refresh must reach the API even inside its public 15-second page cache.
    const r = await call(`/stock/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.error);
    const body = r.body as { sizes?: unknown };
    if (!Array.isArray(body.sizes)) throw new Error('The store answered with something other than stock.');
    return { slug, ready: true, sizes: body.sizes.filter(isRecord).map((s) => ({ size: str(s.size), count: int(s.count) })) };
  },
  // What is left of each line in the bag, by its `slug|colour|size` key. A failed read fails the resource: the bag
  // then says nothing about stock, and the order is checked when it is placed.
  loadBagStock: async ([keys]): Promise<LineStock[]> => {
    if (keys.length === 0) return [];
    const r = await post('/stock/check', { keys });
    if (!r.ok) throw new Error(r.error);
    if (!Array.isArray(r.body)) throw new Error('The store answered with something other than stock.');
    return r.body.filter(isRecord).map((s) => ({ key: str(s.key), count: int(s.count) }));
  },
  // A promo code's worth, from the server, which knows every member's code too. An empty code is worth nothing
  // and asks nothing.
  checkPromo: async ([code]): Promise<Promo> => {
    if (!code) return { code: '', pct: 0 };
    const r = await call(`/promo/${encodeURIComponent(code)}`);
    if (!r.ok) throw new Error(r.error);
    const body = r.body as { code?: unknown; pct?: unknown };
    return { code: str(body.code), pct: int(body.pct) };
  },
  notifyMe: async ([email, slug]): Promise<Notified> => {
    const r = await post('/notify', { email, slug });
    if (!r.ok) return { ok: false, error: r.error, slug };
    return { ok: true, error: '', slug };
  },
  subscribe: async ([email]): Promise<Joined> => {
    const r = await post('/subscribe', { email });
    if (!r.ok) return { ok: false, error: r.error, code: '', returning: false };
    const body = r.body as { code?: unknown; returning?: unknown };
    return { ok: true, error: '', code: str(body.code), returning: body.returning === true };
  },
  signIn: async ([email]): Promise<Account> => {
    const r = await post('/signin', { email });
    return r.ok ? toAccount(r.body) : { ...NO_ACCOUNT, error: r.error };
  },
  loadAccount: async ([email]): Promise<Account> => {
    if (!email) return NO_ACCOUNT;
    const r = await call(`/account?email=${encodeURIComponent(email)}`);
    if (!r.ok) throw new Error(r.error);
    return toAccount(r.body);
  },
  saveName: async ([email, name]): Promise<Account> => {
    const r = await call('/account', { method: 'PATCH', body: JSON.stringify({ email, name }) });
    return r.ok ? toAccount(r.body) : { ...NO_ACCOUNT, error: r.error };
  },
  loadOrders: async ([email]): Promise<Order[]> => {
    if (!email) return [];
    const r = await call(`/orders?email=${encodeURIComponent(email)}`);
    if (!r.ok) throw new Error(r.error);
    return Array.isArray(r.body) ? r.body.map(toOrder).filter((o) => o.found) : [];
  },
  loadOrder: async ([id]): Promise<Order> => {
    if (!id) return NO_ORDER;
    const r = await call(`/orders/${encodeURIComponent(id)}`);
    if (!r.ok) {
      if (r.status === 404) return NO_ORDER;
      throw new Error(r.error);
    }
    return toOrder(r.body);
  },
  placeOrder: async ([email, name, address, city, zip, shipping, lines, promo]): Promise<Placed> => {
    const r = await post('/orders', { email, name, address, city, zip, shipping, lines, promo });
    if (!r.ok) return { ok: false, error: r.error, id: '' };
    return { ok: true, error: '', id: str((r.body as { id?: unknown }).id) };
  },
};
export const answer: Answer = (source, args, store, storage, native) => sources[source](args, store, storage, native);
