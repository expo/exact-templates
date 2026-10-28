// Makes a new Exact app from a template, or makes a template's own app/ runnable to work on it.
//
//   bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <checkout>]
//   bun new.mjs --develop <template> [--exact2 <checkout>]
//
// `exact new` writes an app's generated files for this machine (its crates, `exact.mjs` and
// `Cargo.toml` hold this machine's paths). A new app gets them, then the template's own files go
// over them with the new name and id. `--develop` adds them to the template's app/, where
// .gitignore keeps them out of the repository. The Exact checkout is `--exact2`, else `EXACT2`.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

function main(argv) {
  const { template, path, name, bundleId, exact2, develop } = parse(argv);
  const from = resolve(import.meta.dirname, template, 'app');
  if (!existsSync(from)) {
    fail(`There is no template named "${template}" here (no ${from}). INDEX.md lists the templates: ${templateNames().join(', ')}.`);
  }
  const script = resolve(exact2, 'scripts', 'exact.mjs');
  if (!existsSync(script)) {
    fail(`${exact2} is not an Exact checkout (no scripts/exact.mjs). Pass --exact2 <checkout> or set EXACT2.`);
  }
  const own = JSON.parse(readFileSync(resolve(from, 'app.json'), 'utf8'));
  if (develop) {
    developInPlace(template, from, own, script);
  } else {
    makeApp(template, from, own, script, resolve(path), name, bundleId);
  }
}

function makeApp(template, from, own, script, target, name, bundleId) {
  if (existsSync(target) && readdirSync(target).length > 0) {
    fail(`${target} already has files, and the template would overwrite them. Choose a new or empty directory.`);
  }
  exactNew(script, target, name, bundleId);
  const generated = JSON.parse(readFileSync(resolve(target, 'app.json'), 'utf8'));
  for (const file of ownFiles(from)) {
    copy(resolve(from, file), resolve(target, file));
  }
  writeFileSync(resolve(target, 'app.json'), JSON.stringify(manifest(own, generated), null, 2) + '\n');
  // The template's placeholder id in its data module becomes the new app's
  const appTs = resolve(target, 'app.ts');
  writeFileSync(appTs, readFileSync(appTs, 'utf8').replaceAll(`'${own.app.id}'`, `'${generated.app.id}'`));
  console.log(`\n${target}: ${template} as "${generated.app.name}" (${generated.app.id}). Next: cd ${target} && bun exact.mjs test web`);
}

// The generated files go into the template's app/ beside its own, which stay as they are
function developInPlace(template, from, own, script) {
  const scratch = mkdtempSync(join(tmpdir(), 'exact-template-'));
  try {
    const work = resolve(scratch, template);
    exactNew(script, work, own.app.name, own.app.id);
    let added = 0;
    for (const entry of readdirSync(work, { recursive: true, withFileTypes: true })) {
      const file = relative(work, resolve(entry.parentPath, entry.name));
      if (entry.isFile() && !existsSync(resolve(from, file))) {
        copy(resolve(work, file), resolve(from, file));
        added++;
      }
    }
    console.log(`\n${from}: ${added} generated files added for this machine. Next: cd ${from} && bun exact.mjs test web`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function exactNew(script, target, name, bundleId) {
  const made = Bun.spawnSync(['bun', script, 'new', target, '--name', name, '--bundle-id', bundleId], { stdout: 'inherit', stderr: 'inherit' });
  if (made.exitCode !== 0) {
    fail(`\`exact new\` failed (exit ${made.exitCode}), so no template files were copied. Fix what it printed above and run this again.`);
  }
}

// The template's own files: those Git tracks, so a template being worked on in place gives a new
// app none of its generated ones. Outside a Git checkout, every file.
function ownFiles(from) {
  const listed = Bun.spawnSync(['git', '-C', from, 'ls-files', '-z', '.'], { stdout: 'pipe', stderr: 'pipe' });
  if (listed.exitCode === 0) {
    return listed.stdout.toString().split('\0').filter(Boolean);
  }
  return readdirSync(from, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => relative(from, resolve(entry.parentPath, entry.name)));
}

function copy(source, destination) {
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination);
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
  const exact2 = flags.exact2 ?? process.env.EXACT2;
  const usage = 'Usage: bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <checkout>]\n'
    + '       bun new.mjs --develop <template> [--exact2 <checkout>]\n'
    + 'A new app needs its name and bundle id before its first build; the Exact checkout comes from --exact2 or EXACT2.\n'
    + `Templates: ${templateNames().join(', ')}.`;
  if (flags.develop) {
    if (!exact2) {
      fail(usage);
    }
    return { template: flags.develop, develop: true, exact2: resolve(exact2) };
  }
  const [template, path] = positional;
  if (!template || !path || !flags.name || !flags['bundle-id'] || !exact2) {
    fail(usage);
  }
  return { template, path, name: flags.name, bundleId: flags['bundle-id'], exact2: resolve(exact2), develop: false };
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
