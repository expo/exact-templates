# Exact templates

Whole Exact apps to start a new app from. Each folder is one template.

## Find one

Read `INDEX.md`: one entry per template, with the words people use for that kind of app. To search, grep the `Keywords:` lines (`grep -ri "keywords:.*chat" */TEMPLATE.md INDEX.md`). A template's `TEMPLATE.md` then says what it shows and where in its files, with screenshots in its `screenshots/`, how to adapt it, which hosts it was verified on, the Exact revision it needs, and how it falls short of its reference.

## Make an app from one

```sh
bun new.mjs <template> <path> --name <name> --bundle-id <id> --exact2 <Exact checkout>
cd <path> && bun exact.mjs test web
```

`new.mjs` runs `exact new` for the app's generated files (its crates, `exact.mjs` and `Cargo.toml` hold this machine's paths), then copies the template's `app/` over them and gives the copy the new name and id. Don't copy `app/` into an app by hand. `EXACT2` can stand in for `--exact2`. Then follow the new app's own `AGENTS.md`.

## Add a template

A template is `<name>/` with:

- `app/`: only the app's own files: its contracts, `app.ts` and other modules, tests, `app.json`, `art/` and `assets/`. Leave out what `exact new` generates and anything about one machine or one deployment (`$schema`, `deploy`). `app.json`'s `app.id` and `app.name` are placeholders that `new.mjs` replaces, and `app.ts` names the same id as a quoted string.
- `TEMPLATE.md`, with the sections of `chat/TEMPLATE.md`: a summary, `Keywords:`, screenshots, what it shows and where (name the identifiers to grep for, not line numbers), files, adapt, verified, needs, limits.
- `screenshots/`: the main screens on the hosts it was verified on.

Add its entry to `INDEX.md`. Before committing, make an app from it with `new.mjs` and run that app's tests on every host `TEMPLATE.md` says it was verified on.

## Writing

Write as Exact's `CLAUDE.md` asks: plainly, for a reader new to the app, saying what the reader needs and nothing more, with no history.
