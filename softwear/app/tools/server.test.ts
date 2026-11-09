import { afterAll, beforeAll, expect, test } from 'bun:test';
import { CATALOG } from '../catalog.ts';
import { startApi } from './api-fixture.ts';

let api: Awaited<ReturnType<typeof startApi>>;
beforeAll(async () => { api = await startApi(); });
afterAll(async () => { await api.close(); });

async function request(path: string, body?: unknown, method = 'POST') {
  const response = await fetch(api.origin + path, body === undefined ? {} : {
    method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() as any };
}
const checkout = (lines: string[], promo = '') => ({
  email: 'review@example.com', name: 'Review', address: '1 Test St', city: 'Test', zip: '00000', shipping: 'standard', promo, lines,
});
const stock = async (slug: string, size: string) => (await request(`/stock/${slug}`)).body.sizes.find((s: any) => s.size === size).count;

test('orders aggregate inventory across colours and refuse without consuming other lines', async () => {
  const p = CATALOG.find(p => p.slug === 'challenger-eco-fleece-hoodie')!;
  expect(await stock(p.slug, '2XL')).toBe(3);
  const lines = p.colors.slice(0, 2).map(c => `${p.slug}|${c.name}|2XL|3`);
  expect((await request('/orders', checkout([`${p.slug}|${p.colors[0]!.name}|S|1`, ...lines]))).status).toBe(409);
  expect(await stock(p.slug, '2XL')).toBe(3);
  expect(await stock(p.slug, 'S')).toBe(30);
  expect((await request('/orders', checkout([lines[0], lines[0]]))).status).toBe(409);
  expect(await stock(p.slug, '2XL')).toBe(3);
  const exact = [`${p.slug}|${p.colors[0]!.name}|2XL|1`, `${p.slug}|${p.colors[1]!.name}|2XL|2`];
  expect((await request('/orders', checkout(exact))).status).toBe(201);
  expect(await stock(p.slug, '2XL')).toBe(0);
  expect((await request('/orders', checkout(exact))).status).toBe(409);
});

test('competing orders cannot both consume the last units', async () => {
  const slug = 'go-to-tee';
  const p = CATALOG.find(p => p.slug === slug)!;
  expect(await stock(slug, 'S')).toBe(3);
  const body = checkout([`${slug}|${p.colors[0]!.name}|S|3`]);
  const results = await Promise.all([request('/orders', body), request('/orders', body)]);
  expect(results.map(r => r.status).sort()).toEqual([201, 409]);
  expect(await stock(slug, 'S')).toBe(0);
});

test('issued member codes discount the server-priced order', async () => {
  const account = await request('/signin', { email: 'review@example.com' });
  const p = CATALOG[0]!;
  const placed = await request('/orders', checkout([`${p.slug}|${p.colors[0]!.name}|M|1`], account.body.code));
  expect(placed.status).toBe(201);
  const order = await request(`/orders/${placed.body.id}`);
  expect(order.body.discountCents).toBe(Math.round(p.priceCents / 10));
});

test('write endpoints reject null, arrays, scalars and malformed JSON with JSON errors', async () => {
  for (const [method, path] of [['POST', '/subscribe'], ['POST', '/signin'], ['PATCH', '/account'], ['POST', '/orders'], ['POST', '/notify'], ['POST', '/stock/check']]) {
    for (const body of ['null', '[]', '"text"', 'true', '42', '{']) {
      const response = await fetch(api.origin + path, { method, headers: { 'content-type': 'application/json' }, body });
      expect(response.status, `${method} ${path}: ${body}`).toBe(400);
      expect((await response.json() as any).error).toBe('Send a JSON object.');
    }
  }
});
