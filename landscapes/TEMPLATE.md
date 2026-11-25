# Landscapes

A gallery of the world's landmarks: a sidebar of three pages (Landmarks, Map and Collections), a landmark's page with its photo and an Info inspector, and collections to make and edit. It ports Apple's SwiftUI sample "Landmarks: Building an app with Liquid Glass" to Exact: its screens follow the sample's views, and its text and data are the sample's. On an open iPhone Duo it is a split view with the sidebar; closed, a stack.

Keywords: landmarks, places, travel, gallery, photos, featured hero, header image that stretches when pulled, background extension, mirrored edges under the sidebar, map, MapKit, native module, collections, favorites, sidebar, split view, inspector, info panel, segmented control, cards in a row that scrolls sideways, grid, long-press menu, context menu, share, badges, edit mode, sheet, alert, Liquid Glass, glass button, foldable, iPhone Duo, port of an Apple sample.

There are no screenshots: every screen shows Apple's photographs, which the sample's license does not let anyone redistribute.

## Apple's sample, its license and the photos

`app/LICENSE-APPLE.txt` is Apple's notice for the sample (Copyright 2026 Apple Inc.). It lets anyone use, modify and redistribute the sample's code and text, which `data/landmarks.json` holds, but it "does not include any accompanying photographs". So this template holds no photos: `app/scripts/fetch-images.sh` downloads the photos and the app icon from Apple into `assets/apple/`, which Git ignores (this repository's `.gitignore`, and the `.gitignore` the script writes in that folder for apps made from the template). `app.json`'s `before_build` runs it before every build, so the photos are there without a step of your own. To fetch them ahead, run it alone:

```sh
sh scripts/fetch-images.sh
```

It needs only what macOS ships (`curl`, `tar` and `sips`), downloads about 168 MB once and keeps about 9.5 MB: the backgrounds 1,600 px wide and the thumbnails 600, at JPEG quality 70. When `assets/apple/` is complete it exits at once, with no network. `--help` explains it, `--check` reports, `--force` fetches again.

## What it shows, and where

| Behaviour | Where |
| --- | --- |
| The sidebar's three pages and its search field; a page chosen there replaces the detail; the app opens on Landmarks with the list behind Back; each route's last child, `head title`, names its row in Back's history menu | `app.contract`, the `home` route (`list id="pages"`), `action follow`; `app.json`'s `start_url` |
| Search finds landmarks by name or continent and collections by name. Home owns the results that the field names with `aria-controls`. iOS shows them through UIKit's search controller, in the detail column while the split's columns are side by side (`searchResultsPlacement="detail"`), and they take UIKit's interactive keyboard dismissal. Web and macOS show them below the ordinary sidebar rows. A result opens a direct child of Home, and Back returns to the query. The search close button keeps the text. | `app.contract`, the `home` route, `SearchResults`, `action openResult`, `action keepQuery` |
| The featured landmark, half the window high, its name and Learn More over the photo; the photo continuing, mirrored and blurred, under the sidebar and the Duo's side strip; the photo growing when the page is pulled down | `Featured`, `-exact-safe-area-extend="top start end"`, `pullFeatured` |
| Each continent's landmarks as cards in a row that scrolls sideways | `Strip`, `Card` |
| A card's long-press menu: Share, Favorite, and the collections it is in | `CardMenu`, the card's `contextmenu=aim` and `contextPopover` |
| The map of every landmark: MapKit on iOS, a web module on the web | the `map` route, `landmark-map`; `modules/apple/LandmarkMap.swift`, `modules/web/index.js` |
| A landmark's page: its photo with the mirror, growing when pulled; Share, Favorite, its collections and Info in the bar | the `landmark` route, `pullHero`, `id="collections-menu"` |
| The Info inspector: beside the page on an open Duo, a sheet when closed; Map or Activities, kept across a close and another landmark; the metadata; the activities and the badge they earn | the `info` route (`navigationInspector=true`), `segment`, `Value`, `activities`, `BadgeMark` |
| Collections: Favorites as a row of cards, My Collections as a grid; + adds one and opens it | the `collections` route, `CollectionTile`, `addCollection`, `openAdded` |
| A collection: Edit to rename it, describe it and choose its landmarks in a sheet; Delete behind the platform's alert. Editing is the page's own state, made with it and gone with it, so the sheet over it leaves it editing | the `collection` route, `CollectionPage` (its `editing`), `CollectionEditor`, the `select` route, the `delete-collection-…` dialog, its id the page's entry |
| The earned badges, behind a glass button in the corner | `Badges`, `toggleBadges` |

## Files

`app.contract` holds every screen and its state. `app.ts` is the data module: the landmarks from `data/landmarks.json`, and the collections in memory, as the sample keeps them. `strings/en.json` is the location prompt's text. `modules/` is the map, native on iOS and a script on the web. `app.test.contract` drives the UI. `search.test.mjs` checks browser launch, history, and modified links after `bun exact.mjs web-build`. Run it with `EXACT2` set to the checkout used by the build. `scripts/fetch-images.sh` fetches the photos and icon into `assets/apple/`. `LICENSE-APPLE.txt` is Apple's notice.

## Adapt

- Your own places: replace `data/landmarks.json`, put your photos in a folder Git keeps, such as `assets/places/`, as `<id>.jpg` and `<id>-thumb.jpg`, and change the contract's `assets/apple/` paths to it. Then delete `scripts/fetch-images.sh`, `assets/apple/` and `app.json`'s `before_build`, and name your own icon in `app.json`'s `host.ios.icon`.
- The continents' order is `continents()`; the favorites are the collection with id `1001` (`isFavorite`).
- Collections last until the app quits: `sources` in `app.ts` is where to save them.

## Verified

With the Exact commit in `exact.json`, from `app/`: `bun exact.mjs test web` passes, and after `bun exact.mjs web-build`, `bun test search.test.mjs` passes in Chromium. On a folded iPhone Duo simulator (iOS 27.1), `bun exact.mjs test ios` passes. On the open one it passes all but the search test, whose 390×844 launch at Home finds Home off screen (`QUEUE.md`). On macOS, `bun exact.mjs test macos` passes the launch, Info, search and card-menu tests; the Favorite button and the collection's Edit and Delete fail there (`QUEUE.md`). The Linux and Android builds have not been run.

## Needs

`exact.json` pins Exact's `landscapes/map-resize` branch of github.com/expo/exact, which is not on Exact's main. The template relies on what that branch adds: automatic safe-area insets for a route's content, the inspector (`navigationInspector`), the split on iPhone Duo, and a header search whose results Home owns through `aria-controls` (LLP 1127.000). It uses `app.json`'s `before_build` to fetch the photos.

## Limits

`QUEUE.md` tracks open issues. Fetching the photos needs a Mac because the script scales them with `sips`. On other machines, copy the complete `assets/apple/` directory from a Mac before building.
