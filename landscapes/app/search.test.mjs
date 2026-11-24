import assert from 'node:assert/strict';
import { test } from 'bun:test';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

const exact = process.env.EXACT2;
if (!exact) throw new Error('Set EXACT2 to the checkout used to build Landscapes.');
const { resolveApp, webDist } = await import(resolve(exact, 'scripts/app.mjs'));
const { suiteBrowser } = await import(resolve(exact, 'scripts/agent-launch.mjs'));
const { serveBuildTree } = await import(resolve(exact, 'host/web/serve.mjs'));

test('Landscapes launch and search preserve browser navigation', async () => {
  const dist = webDist(resolveApp(import.meta.dir));
  const server = createServer((request, response) => serveBuildTree(dist, request, response));
  await new Promise((ready, refuse) => {
    server.once('error', refuse);
    server.listen(0, '127.0.0.1', ready);
  });
  try {
    const browser = await suiteBrowser();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      page.setDefaultTimeout(8000);
      const origin = `http://127.0.0.1:${server.address().port}`;
      const manifestURL = new URL('/manifest.json', origin);
      const response = await page.request.get(manifestURL.href);
      assert.equal(response.status(), 200);
      const manifest = await response.json();
      await page.goto(new URL(manifest.start_url, manifestURL).href);
      await page.getByTestId('featured').waitFor();
      assert.equal(new URL(page.url()).pathname, '/landmarks');

      await page.goto(origin);
      const search = page.getByTestId('search');
      const history = () => page.evaluate(() => ({
        length: window.history.length,
        index: navigation.currentEntry.index,
        entries: navigation.entries().map(entry => [entry.key, entry.url]),
      }));
      await search.waitFor();
      const home = await history();
      await search.fill('mount');
      await page.getByTestId('result-1007').waitFor();
      assert.deepEqual(await history(), home);
      await search.fill('fuji');
      const fuji = page.getByTestId('result-1016');
      await fuji.waitFor();
      assert.deepEqual(await history(), home);

      const [detail] = await Promise.all([
        page.context().waitForEvent('page', { timeout: 5000 }),
        fuji.click({ modifiers: ['ControlOrMeta'] }),
      ]);
      await detail.waitForURL('**/landmark/1016');
      await detail.getByTestId('detail-name').waitFor();
      assert.equal(await detail.getByTestId('detail-name').textContent(), 'Mount Fuji');
      assert.deepEqual(await history(), home);
      await detail.close();

      await fuji.click();
      await page.waitForURL('**/landmark/1016');
      assert.equal((await history()).index, home.index + 1);
      await page.goBack();
      await fuji.waitFor();
      assert.equal(await search.inputValue(), 'fuji');
    } finally {
      await browser.close();
    }
  } finally {
    server.closeAllConnections();
    await new Promise(done => server.close(done));
  }
}, 30_000);
