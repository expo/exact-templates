import { resolve } from 'node:path';

export const project = resolve(import.meta.dir, '..');

export async function startApi() {
  const reserved = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: () => new Response() });
  const origin = `http://127.0.0.1:${reserved.port}`;
  reserved.stop(true);
  const process = Bun.spawn([Bun.argv[0]!, 'server.ts'], {
    cwd: project,
    env: { ...Bun.env, API_BASE_URL: origin, DB: ':memory:' },
    stdout: 'ignore', stderr: 'pipe',
  });
  const close = async () => { process.kill(); await process.exited; };
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(`${origin}/health`)).ok) return { origin, close }; } catch {}
    if (process.exitCode !== null) break;
    await Bun.sleep(50);
  }
  await close();
  throw new Error(`API did not start: ${await new Response(process.stderr).text()}`);
}
