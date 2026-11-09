import { afterEach, expect, test } from 'bun:test';
import { answer } from '../app.ts';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const order = () => answer('loadOrder', ['SW-10001'], undefined as never, undefined as never, undefined as never);

test('only HTTP 404 means an order does not exist', async () => {
  globalThis.fetch = (async () => Response.json({ error: 'No such order.' }, { status: 404 })) as typeof fetch;
  expect(await order()).toMatchObject({ found: false });
  globalThis.fetch = (async () => Response.json({ error: 'Temporarily unavailable.' }, { status: 503 })) as typeof fetch;
  await expect(order()).rejects.toThrow('Temporarily unavailable.');
  globalThis.fetch = (async () => { throw new Error('offline'); }) as typeof fetch;
  await expect(order()).rejects.toThrow('Can’t reach the store');
});
