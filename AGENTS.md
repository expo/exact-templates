# Exact templates

Whole Exact apps to start a new app from. Each folder is one template.

## Find one

Read `INDEX.md`: one entry per template, with the words people use for that kind of app. To search, grep the `Keywords:` lines (`grep -ri "keywords:.*chat" */TEMPLATE.md INDEX.md`). A template's `TEMPLATE.md` then says what it shows and where in its files, with screenshots in its `screenshots/`, how to adapt it, which hosts it was verified on, the Exact revision it needs, and how it falls short of its reference.

## Make an app from one

```sh
bun new.mjs <template> <path> --name <name> --bundle-id <id> [--exact2 <Exact checkout>]
cd <path> && bun exact.mjs test web
```

Each template is built on its own Exact: `<template>/exact.json` pins one commit of an Exact repository, with the branch that holds it there. Exact has no releases, and an app uses an Exact checkout by path, so `new.mjs` gives the app a checkout of that commit: the first app from a pin fetches only that commit and makes its checkout in `~/.exact/exact2/<commit>`, and later apps reuse it. `--exact2` uses another checkout instead, such as one you are changing Exact in, and warns when it lacks the pinned commit.

`new.mjs` runs that checkout's `exact new` for the app's generated files (its crates, `exact.mjs` and `Cargo.toml` hold this machine's paths, the checkout's among them), then copies the template's own files, those Git tracks in its `app/`, over them and gives the copy the new name and id. Don't copy `app/` into an app by hand. Then follow the new app's own `AGENTS.md`.

## Work on a template

A template's `app/` is the app itself, developed where it is:

```sh
bun new.mjs --develop <template> [--exact2 <Exact checkout>]
cd <template>/app && bun exact.mjs test web
```

`--develop` adds the generated files to `app/`, and `.gitignore` keeps them, and what builds write, out of the repository. Commit only the app's own files. `<template>/QUEUE.md` is what to do next on that template: add a line when you find something worth doing, delete it when it lands. Deployment details (an AppDrop link, a preview server) stay on the machine that uses them.

## Add a template

A template is `<name>/` with:

- `app/`: only the app's own files: its contracts, `app.ts` and other modules, tests, `app.json`, `art/` and `assets/`. Leave out what `exact new` generates and anything about one machine or one deployment (`$schema`, `deploy`). `app.json`'s `app.id` and `app.name` are placeholders that `new.mjs` replaces, and `app.ts` names the same id as a quoted string.
- `exact.json`: the Exact the template is built on, `{"repository": "https://github.com/…/exact2.git", "branch": "…", "commit": "<all 40 hex digits>"}`. The commit must be on that branch there, so that `new.mjs` can fetch it. Move the pin when the template needs a newer Exact, and test the template on it.
- `TEMPLATE.md`, with the sections of `chat/TEMPLATE.md`: a summary, `Keywords:`, screenshots, what it shows and where (name the identifiers to grep for, not line numbers), files, adapt, verified, needs, limits.
- `screenshots/`: the main screens on the hosts it was verified on.
- `QUEUE.md`: what to do next on it.

Add its entry to `INDEX.md`. Before committing, make an app from it with `new.mjs` and run that app's tests on every host `TEMPLATE.md` says it was verified on.

## Writing

Write as Exact's `CLAUDE.md` asks: plainly, for a reader new to the app, saying what the reader needs and nothing more, with no history.
