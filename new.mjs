// Makes a new Exact app from a template, or makes a template's own app/ runnable to work on it.
//
//   bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <checkout>]
//   bun new.mjs --develop <template> [--exact2 <checkout>]
//
// Each template is built on its own Exact: `<template>/exact.json` pins one commit of an Exact
// repository. Exact has no releases and an app uses an Exact checkout by path, so the app gets a
// checkout of that commit, which this script makes once per commit in ~/.exact/exact2/<commit>.
// `--exact2 <checkout>` uses another checkout instead.
//
// `exact new` writes an app's generated files for this machine (its crates, `exact.mjs` and
// `Cargo.toml` hold this machine's paths, the Exact checkout's among them). A new app gets them,
// then the template's own files go over them with the new name and id. `--develop` adds them to the
// template's app/, where .gitignore keeps them out of the repository.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

function main(argv) {
  const { template, path, name, bundleId, override, develop } = parse(argv);
  const from = resolve(import.meta.dirname, template, 'app');
  if (!existsSync(from)) {
    fail(`There is no template named "${template}" here (no ${from}). INDEX.md lists the templates: ${templateNames().join(', ')}.`);
  }
  const pin = pinOf(template);
  const exact2 = override ? overridden(override, pin) : checkout(pin);
  const script = resolve(exact2, 'scripts', 'exact.mjs');
  const own = JSON.parse(readFileSync(resolve(from, 'app.json'), 'utf8'));
  if (develop) {
    developInPlace(template, from, own, script);
  } else {
    makeApp(template, from, own, script, resolve(path), name, bundleId);
  }
}

// The Exact the template is built on: a repository, the branch there that holds the pinned commit,
// and the commit
function pinOf(template) {
  const file = resolve(import.meta.dirname, template, 'exact.json');
  if (!existsSync(file)) {
    fail(`${template} pins no Exact: ${file} is missing. A template names the Exact commit it is built on there: {"repository": "https://github.com/expo/exact", "branch": "…", "commit": "<40 hex digits>"}.`);
  }
  const pin = JSON.parse(readFileSync(file, 'utf8'));
  if (typeof pin.repository !== 'string' || typeof pin.branch !== 'string' || !/^[0-9a-f]{40}$/.test(pin.commit ?? '')) {
    fail(`${file} must name a "repository", the "branch" that holds the commit there, and the full 40-digit "commit".`);
  }
  return pin;
}

// The pinned commit's checkout, made once: only that commit is fetched, into one store that all the
// checkouts share, and each checkout is a worktree of that store named by its commit
function checkout(pin) {
  const root = resolve(homedir(), '.exact');
  const dir = resolve(root, 'exact2', pin.commit);
  if (existsSync(resolve(dir, 'scripts', 'exact.mjs'))) {
    console.log(`Exact: ${dir} (${pin.branch}, this template's pin)`);
    return dir;
  }
  const store = resolve(root, 'exact2.git');
  if (!existsSync(store)) {
    git(['init', '--quiet', '--bare', store], 'could not make the store for Exact checkouts');
  }
  if (!hasCommit(store, pin.commit)) {
    console.log(`Fetching Exact ${pin.commit.slice(0, 10)} (${pin.branch}) from ${pin.repository}…`);
    const fetched = Bun.spawnSync(['git', '-C', store, 'fetch', '--quiet', '--depth=1', pin.repository, pin.commit], { stdout: 'inherit', stderr: 'pipe' });
    if (fetched.exitCode !== 0 || !hasCommit(store, pin.commit)) {
      fail(`${pin.repository} did not give commit ${pin.commit}, which this template pins (${fetched.stderr.toString().trim()}). If ${pin.branch} has not been pushed there yet, pass --exact2 <a checkout that has the commit>.`);
    }
  }
  // Made beside its final place and renamed when ready, so that a checkout there is complete
  const partial = `${dir}.partial`;
  rmSync(partial, { recursive: true, force: true });
  git(['-C', store, 'worktree', 'prune'], 'could not tidy the store\'s worktrees');
  git(['-C', store, 'worktree', 'add', '--quiet', '--detach', partial, pin.commit], `could not check out ${pin.commit}`);
  const installed = Bun.spawnSync(['bun', 'install', '--frozen-lockfile'], { cwd: partial, stdout: 'inherit', stderr: 'inherit' });
  if (installed.exitCode !== 0) {
    fail(`\`bun install\` failed in ${partial} (exit ${installed.exitCode}), above. Fix that and run this again.`);
  }
  git(['-C', store, 'worktree', 'move', partial, dir], `could not move ${partial} to ${dir}`);
  console.log(`Exact: ${dir} (${pin.branch}, this template's pin)`);
  return dir;
}

// A checkout the caller chose: used as given, with a warning when it lacks the pinned commit
function overridden(path, pin) {
  const dir = resolve(path);
  if (!existsSync(resolve(dir, 'scripts', 'exact.mjs'))) {
    fail(`${dir} is not an Exact checkout (no scripts/exact.mjs). Leave out --exact2 to use the template's own Exact.`);
  }
  const contains = Bun.spawnSync(['git', '-C', dir, 'merge-base', '--is-ancestor', pin.commit, 'HEAD'], { stdout: 'pipe', stderr: 'pipe' }).exitCode === 0;
  if (!contains) {
    console.warn(`Warning: ${dir} does not contain this template's Exact, ${pin.commit.slice(0, 10)} (${pin.branch}), so the app may lack what the template relies on (TEMPLATE.md, "Needs"). Leave out --exact2 to use the pinned Exact.`);
  }
  console.log(`Exact: ${dir} (--exact2)`);
  return dir;
}

function hasCommit(repository, commit) {
  return Bun.spawnSync(['git', '-C', repository, 'cat-file', '-e', `${commit}^{commit}`], { stdout: 'pipe', stderr: 'pipe' }).exitCode === 0;
}

function git(args, what) {
  const ran = Bun.spawnSync(['git', ...args], { stdout: 'pipe', stderr: 'pipe' });
  if (ran.exitCode !== 0) {
    fail(`git ${what}: ${ran.stderr.toString().trim()}`);
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
    // Named as the folder the files go to: Exact names an app's crates by its folder, and `exact.mjs` must agree
    const work = resolve(scratch, basename(from));
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
  const usage = 'Usage: bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <checkout>]\n'
    + '       bun new.mjs --develop <template> [--exact2 <checkout>]\n'
    + 'A new app needs its name and bundle id before its first build. It uses the Exact its template pins\n'
    + '(<template>/exact.json), checked out in ~/.exact/exact2/<commit>, or the checkout --exact2 names.\n'
    + `Templates: ${templateNames().join(', ')}.`;
  if (flags.develop) {
    return { template: flags.develop, develop: true, override: flags.exact2 };
  }
  const [template, path] = positional;
  if (!template || !path || !flags.name || !flags['bundle-id']) {
    fail(usage);
  }
  return { template, path, name: flags.name, bundleId: flags['bundle-id'], override: flags.exact2, develop: false };
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
