# Softwear follow-up

- Verify an app generated from the template on iOS, Android and macOS and add native screenshots.
- Replace demo authentication, payment-free checkout and unsent email notifications before adapting this into a live store.

- Investigate the 12 largest-text overlap findings involving the bag toast and product content.
- Investigate the web DOM adoption refusal on filtered catalogue pages. Distinguish expected stock/order network-failure diagnostics in regression tests from unexpected runtime refusals.
- `bun exact.mjs ios` fails in an app made with `new.mjs --develop`: the app's folder is `app`, so the generated crates are `app-apple` and so on, but `exact.mjs` names the app `softwear` and builds `softwear-apple` ("Cargo has no softwear-apple target"). Every template's `--develop` checkout likely has the same mismatch. Until it is fixed, build with `EXACT_APP_DIR=<template>/app bun host/apple/build.mjs …` from the Exact checkout.
- Move the pin to an Exact with `bun exact.mjs share`, which builds the iPhone app and prints an AppDrop link. The pinned commit has no `share`: an AppDrop build there means running `host/apple/build.mjs --device --archive <out.ipa> --unsigned` with `deploy.store.ios` set to `"0"` (or deploy signing keys) and `API_BASE_URL` set to a server the phone can reach, then `npx appdrop <out.ipa>`.
