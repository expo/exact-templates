# Landscapes: queue

What to do next for this template, most pressing first. Add a line when you find something worth doing; delete it when it lands.

## Reported from the iPhone Duo

The user's reports, newest first, until each is fixed or answered. Build 11 (AppDrop, 2026-10-31) runs the Duo series at `8649d0f1a5` (`9a5d74eb5f` since the series was rewritten).

- **A peeked card is cut off at its top and bottom** (2026-11-02, the main screen's strips). Measured on the open Duo simulator with real touches: build 11 lifts a picture of the card targeted at its superview, the strip's `UIScrollView`, exactly as tall as the cards, and UIKit grows the picture inside it, so mid-lift the card is 7% wider and still the strip's 140 points tall, its shadow cut at the strip's edges. With ccheever/exact2 #1310, which lifts the card itself, the card stays whole and leaves the strip as it grows; only the shadow UIKit draws while the press highlights, before the lift, ends at the strip's edges for a few frames. That is UIKit's own behavior: a plain UIKit app's horizontal `UICollectionView` of 140-point cells, and plain views in a 140-point `UIScrollView` with UIKit's default preview, highlight the same way. Fixed by #1310 on the series, with its later fixes in build 13: the card's shadow whole, no flashing rectangle; the user on the phone (2026-11-02): "New landscapes has better peek".
- **A released peek leaves the card blank for about a second** (2026-11-02). Measured: build 11 hides the card (`alpha` 0) while its picture is lifted and shows it again only when UIKit's dismissal completes; UIKit shrinks and fades the picture instead of returning it, so the card's place is white for 23 frames (0.77 s on a loaded Mac) and the card snaps back. With #1310 the host hides nothing and UIKit returns the card itself: no white frame.
- **The hero shrinks badly when the sidebar opens** (2026-10-29): "Landscapes SwiftUI … just seamlessly zooms in."
- **The featured landmark's touch feedback** (2026-10-29, 2026-10-31): the sample's wash covers the hero's full width, and it fades in and out. The whole hero and its mirror now fade together; its depth and its release still differ (below).
- **The badges are less bright than SwiftUI's** (2026-10-29), which wants an answer why; and their menu should animate them in and out as SwiftUI's does.
- **The mirror's seam and its motion** (2026-10-31; below).
- **Focusing a new collection's title scrolls too far** (2026-10-31; below).
- **The right sidebar is not draggable** (2026-10-31). Measured: UIKit, the sample and Landscapes resize the inspector from its leading edge alike, and none opens or closes it with a drag. Waiting on which drag the user tried.
- **From the split work** (2026-10-30): the main content should follow the sidebar's curve, and the segmented control sometimes loses its background.
- **The scroll indicator should sit outside the Duo's side buttons**, as UIKit's does (with Exact's new safe-area API, below).

## Found while porting

- **Three of the four tests stop at the bar's grouped buttons** (2026-11-01, in Exact). `bun exact.mjs test ios` on the open Duo refuses to tap Favorite and Info, which are in a `row role="group"` in the landmark's header: "tap #161: `_UIButtonBarButton`, in node #1, covers its middle". The driver finds a header button's bar item through the navigation's `barItem` (`AgentAimIOS.swift`); when it finds none, the tap falls back to the node's own point, under UIKit's button. Grouping is not the cause by reading: a grouped button is an ordinary item in `rightBarButtonItems`, with a fixed space before its group (`barItems`, `NavigationBarIOS.swift`). `barItem` takes only a route that is its navigation controller's top view controller with its bar showing, so the landmark's page in the Duo series' split detail column is the place to look. It belongs with the split (LLP 1127).
- **The web build opens on the sidebar's list** (2026-11-01). `bun exact.mjs test web` fails "a compact width opens on the Landmarks page", and the other tests then find no cards. iOS opens on `start_url`'s Landmarks page.
- **The mirror's seam and its motion.** At a 130° fold UIKit's own `UIBackgroundExtensionView` draws a light column one pixel wide at the fold band's edge (Apple's sample shows it too). While the Duo folds, a white band several pixels wide opens between the mirror and the photo for a few frames.
- **The hero's press depth and release.** Measured at one hero pixel (about 70 red at rest): pressed, the sample shows 117 and Exact 134; released, the sample brightens to about 160 for about 40 ms before it pushes, and Exact pushes at once.
- **Focusing a new collection's title scrolls the page further than needed.** Compare with a hand-built UIKit screen with a field at the same place, then Exact's keyboard reveal.
- **The delete button should anchor its confirmation** (in Exact). A header button with `commandfor` and `command="show-modal"` and no `press` is left out of the bar, so the confirmation is a centred alert where the sample's is an action sheet at the trash button.
- **Move to Exact's new safe-area API when it lands.** The paddings by `var(--exact-safe-area-inset-left)` and `-right` and the `-exact-safe-area` opt-outs then go.
