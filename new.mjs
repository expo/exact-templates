// Makes a new Exact app from a template: `exact new` writes the app's generated files for this
// machine, then the template's own files go over them, keeping the new app's name and id.
//
//   bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <checkout>]
//
// The Exact checkout is `--exact2`, else `EXACT2`. INDEX.md lists the templates.
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

function main(argv) {
  const { template, path, name, bundleId, exact2 } = parse(argv);
  const from = resolve(import.meta.dirname, template, 'app');
  if (!existsSync(from)) {
    fail(`There is no template named "${template}" here (no ${from}). INDEX.md lists the templates: ${templateNames().join(', ')}.`);
  }
  const target = resolve(path);
  if (existsSync(target) && readdirSync(target).length > 0) {
    fail(`${target} already has files, and the template would overwrite them. Choose a new or empty directory.`);
  }
  const script = resolve(exact2, 'scripts', 'exact.mjs');
  if (!existsSync(script)) {
    fail(`${exact2} is not an Exact checkout (no scripts/exact.mjs). Pass --exact2 <checkout> or set EXACT2.`);
  }
  const made = Bun.spawnSync(['bun', script, 'new', target, '--name', name, '--bundle-id', bundleId], { stdout: 'inherit', stderr: 'inherit' });
  if (made.exitCode !== 0) {
    fail(`\`exact new\` failed (exit ${made.exitCode}), so no template files were copied. Fix what it printed above, delete ${target}, and run this again.`);
  }
  const generated = JSON.parse(readFileSync(resolve(target, 'app.json'), 'utf8'));
  const own = JSON.parse(readFileSync(resolve(from, 'app.json'), 'utf8'));
  cpSync(from, target, { recursive: true });
  writeFileSync(resolve(target, 'app.json'), JSON.stringify(manifest(own, generated), null, 2) + '\n');
  // The template's placeholder id in its data module becomes the new app's
  const appTs = resolve(target, 'app.ts');
  writeFileSync(appTs, readFileSync(appTs, 'utf8').replaceAll(`'${own.app.id}'`, `'${generated.app.id}'`));
  console.log(`\n${target}: ${template} as "${generated.app.name}" (${generated.app.id}). Next: cd ${target} && bun exact.mjs test web`);
}

// The template's manifest under the new app's schema, name and id
function manifest(own, generated) {
  const { id, name } = generated.app;
  return { $schema: generated.$schema, ...own, name, short_name: name, id, app: { ...own.app, id, name } };
}

function parse(argv) {
  const positional = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  const [template, path] = positional;
  const exact2 = flags.exact2 ?? process.env.EXACT2;
  if (!template || !path || !flags.name || !flags['bundle-id'] || !exact2) {
    fail('Usage: bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <checkout>]\n'
      + 'The name and bundle id are needed before the first build; the Exact checkout comes from --exact2 or EXACT2.\n'
      + `Templates: ${templateNames().join(', ')}.`);
  }
  return { template, path, name: flags.name, bundleId: flags['bundle-id'], exact2: resolve(exact2) };
}

function templateNames() {
  return readdirSync(import.meta.dirname, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(resolve(import.meta.dirname, entry.name, 'TEMPLATE.md')))
    .map(entry => entry.name);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (import.meta.main) {
  main(process.argv.slice(2));
}
