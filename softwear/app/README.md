# Softwear

Alternative Apparel's hoodies, tees and joggers, sold direct: a demonstration store built with
Exact. One source (`app.contract`, `app.ts`) is the website and the iOS and Android apps. No
payment is taken and nothing ships. Alternative Apparel is a trademark of its owner; this store is
not affiliated with it.

## What it has

- A catalog of 46 styles (`catalog.ts`): the real style numbers where the wholesale catalog lists
  them, colours, sizes, fabric, fit and details. Each style has a product photo (`assets/t`, the card
  size; `assets/p`, the product page's), and a colour its own where one was found; the originals and
  their sources are in `photos/` (`manifest-*.json`), and `Garment` in `app.contract` draws any style
  that has none. The photos are the retailers' listing shots of Alternative Apparel's garments, for
  this demonstration only. They come in several shapes, so each is shown whole in a white frame
  (`Photo`, `Frame` in `app.contract`), dimmed a little in dark mode. Two shots in `assets/` are
  mirrored copies of another style's (the women's Eco-Jersey zip hoodie and the Eco-Jersey slouchy
  pullover, whose retailers served the same picture), and a customer's embroidery was painted out of
  the Eco-Jersey zip hoodie's; `photos/` keeps the originals.
- The home page, the shop (filtered and sorted by its URL's query: `/shop?c=hoodies&g=women&s=price-asc&z=M`,
  by category, who it is for, size and price) and the story, with its size tables, render when the site is
  built, so they arrive whole, as a static site's pages do.
- A product page per style (`/p/<slug>`), rendered per request with what is left of each size, so
  it says what is sold out (struck through, with "Tell me when it's back") and marks what is nearly
  gone. Colour and size pickers (the size carries to the next style, unless it is sold out there), a
  quantity stepper, a saved heart, what the style is worn with and more of its kind.
- Search, by name, fabric, category, colour, fit, style number and tag.
- A bag kept on the device: quantities, removal, each line checked against the server's stock, promo
  codes the server prices (`WELCOME15`, `FLEECE10`, and every member's own `FRIEND` code), free
  shipping over $75. The code a signup earns applies itself in one press. Adding or applying says so in
  a toast at the bottom of the window (in the app, at the bottom of the route: above the tab bar, and short of
  the tab rail on an iPhone Duo, off the hinge on a book fold), with a way to the bag, for five
  seconds or until dismissed.
- Checkout with an address (kept on the device for the next order) and a shipping choice; the server
  checks stock, prices the order and gives it a number; the order has its own page. A refusal names
  the line and offers the bag.
- Join the list for a welcome code; sign in with an email alone (no password: a demo) for orders, a
  name and a member code. Saved styles and the appearance setting are the device's, signed in or not.
- In the installed app: the platform's bars, a tab bar (Shop, Search, Bag, Account) with each tab's
  own stack, and a haptic on add and save. In a browser: the site's header, nav and
  footer.
- A card's photo flies into the product page: on iOS 18 and later as UIKit's zoom transition
  (`navigationSource` on the product route), in a browser as a view transition (`sharedElement` on
  the two photos; a browser keeps only the shown page's content, so the pair hands over in one
  commit). The name is the card's page's (`shop-photo-<slug>` on the home page, `catalog-photo-<slug>`
  in the shop), and the product's photo takes the name of the page beneath it, so a home card never
  pairs with the same card in the shop, which would scroll the shop to it. The browser's Back lands at
  once, without the flight.
- Tap the product photo and it opens large on its own route (`/p/<slug>/photo`): a full-screen cover in the
  app, which iOS 18 zooms out of the gallery, and a dialog in a browser. Pinch, double-tap and drag zoom it,
  the wheel too on a desktop; pulling it down closes it, as do its Close button and Back. The viewer is
  `zoom-image`, the app's one native module (`modules/`): a `UIScrollView` on iOS, a `View` drawing through a
  matrix on Android, a pointer-event element on the web.
- The mark: a soft teddy bear with the S on its chest, in `assets/brand/`, drawn by `tools/logo.ts`.
  `icon-1024.png` (an oat bear on clay) is the app icon and the site's favicon (`icons` in `app.json`);
  `mark.svg`, the same bear as a silhouette with the S cut out, is the design's `icon.mark`, drawn in
  the site's header and footer in the text's colour, so it follows dark mode.

## Run it

```sh
bun exact.mjs test web          # the tests, in Chrome, with server.ts on an empty database
bun exact.mjs web               # the dev loop: a URL that rebuilds on save (run `bun server.ts` beside it)
bun exact.mjs web-build --out dist && bun server.ts & bun exact.mjs serve dist   # the site as deployed
bun exact.mjs ios --run         # the iOS app on a simulator
bun exact.mjs android --run     # the Android app on the connected device or emulator
bun exact.mjs test ios          # the tests on iOS (the app's tab-bar test runs here, not on the web)
```

`server.ts` is the API (Bun, SQLite in `data.db`): stock per size, promo codes, the mailing list,
restock requests, accounts and orders. Its origin is `API_BASE_URL` (`.env`, `app.json`'s `env`); a build for elsewhere sets it
in the environment or `.env.local`. A phone reaches a Mac's server by the Mac's LAN address.

## Where things are

Regression checks: `bun test tools/server.test.ts tools/data.test.ts` exercises inventory transactions, input validation and
order-fetch failures against an isolated in-memory API. `bun exact.mjs web-build --out target/browser-test && EXACT_WEB_DIST=target/browser-test bun test tools/browser.test.ts` builds a separate
web copy, then checks delayed checkout replies and photo gestures in headless Chrome, using the
Exact checkout's Playwright installation. `bun exact.mjs test web` also runs
`regressions.test.contract`, covering quantity limits, subscription and order refreshes, editable
names, stock isolation, stock consumption and order retries. The API tests never use `data.db`.

| File | What |
|---|---|
| `app.contract` | Every page and screen, the bag's arithmetic, the garment drawings |
| `app.ts` | The data module: the catalog, and the API's reads and writes |
| `catalog.ts` | The products, each naming its photos |
| `photos/` | The photos as found, with where each came from; `assets/p` and `assets/t` are the sizes the site ships |
| `server.ts` | The API |
| `app.tamber` | The brand's colours, light and dark, and the mark as an icon token |
| `assets/brand/` | The mark: the app icon and the SVG the site draws, written by `tools/logo.ts` |
| `modules/` | `zoom-image`, the photo viewer: Swift for iOS, Kotlin for Android, JavaScript for the web |
| `app.test.contract` | The tests (`test web`, `test ios`, `test android`) |
