# Softwear follow-up

- Verify an app generated from the template on iOS, Android and macOS and add native screenshots.
- Replace demo authentication, payment-free checkout and unsent email notifications before adapting this into a live store.

- Investigate the 12 largest-text overlap findings involving the bag toast and product content.
- Investigate the web DOM adoption refusal on filtered catalogue pages. Distinguish expected stock/order network-failure diagnostics in regression tests from unexpected runtime refusals.
- Before moving the pin past `1cbce180d4`: on `expo/exact` `4f5cc4abf1` and later, `web-build` fails with `TypeError: Invalid URL` in `historyURL` (`host/web/navigation.js`), which builds `new URL(location.origin + path)` while pages render under Bun, whose `location.origin` is empty (`host/web-js/render.mjs`). Move the pin once Exact fixes that.
- `bun exact.mjs share` refuses this app as it stands: the build is a release, and with an update store it needs `deploy.signing.keys`. Exact's `share` could build a tester's binary without them, as it starts its own stream anyway.
