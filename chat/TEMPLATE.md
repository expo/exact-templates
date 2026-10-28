# Chat

A chat app: a list of conversations, and a conversation's transcript over a composer that rides on the keyboard. Conversations and drafts are saved on the device; there is no server or account.

Keywords: chat, messaging, messenger, conversation, inbox, thread, transcript, message bubbles, balloons, tails, composer, text input over the keyboard, input accessory, keyboard avoidance, interactive keyboard dismissal, virtualized list that follows its end, load earlier messages, typing indicator, read receipt, delivered, reply, swipe to reply, long-press menu, copy, delete, context menu, peek, preview, popover, Liquid Glass, glass group, blur under a bar, split view, sidebar, list and detail, drafts, local persistence.

![The list of conversations on an iPhone](screenshots/iphone-list.png)
![A conversation on an iPhone](screenshots/iphone-conversation.png)
![The list beside a conversation on an iPad](screenshots/ipad-split.png)

## What it shows, and where

| Behaviour | Where |
| --- | --- |
| The conversation list: avatar, name and last message, lines from the text, a long press that peeks at the conversation | `app.contract`, the `inbox` route and `id="conversation-peek"` |
| List beside the conversation on an iPad, the iPhone Duo open, or a window 900 px wide; a pushed conversation on a phone | `app.contract`, `routes` and `follow`; the rows are links |
| A transcript that opens at its newest message and follows it, built only where it shows | `app.contract`, `list id="transcript"` (`virtualized`, `scroll-start="end"`, `scrollFollowEnd`) |
| 240 earlier messages put above the reader without moving what they read | `app.contract`, `action history` |
| Balloons with tails, grouped in runs; the read receipt; the typing indicator | `bubble.contract`, `Balloon`, `MessageRow`, `Typing` |
| A message's long-press menu (copy, reply, delete) and swipe to reply | `bubble.contract`, `contextmenu` and `swiperight`; `app.contract`, `id="message-menu"` |
| The composer: a growing field in a glass pill, a glass + beside it in one glass group, a blur behind the bar, Send | `composer.contract`, `Composer` |
| The composer on the keyboard, and the keys' interactive dismissal | `composer.contract`'s padding and comment; `keyboardDismissMode="interactive"` on the transcript |
| The + card that opens over the keyboard | `app.contract`, `id="add-menu"`; `types.contract`, `CardRow`, `CardTile`, `CardGlyph` |
| A send's flight from the field to its row, and a received message popping in | `app.contract`, `action send`, `action animate`, `id="send-flight"`; `types.contract`, `keyframes arrive` |
| Saving every conversation and its draft in one file, one write at a time | `app.ts`, `answer`; `model.ts`, the people and seeded conversations |

## Files

`app.contract` holds the routes, the conversation and its state, the send animation and the popovers. `bubble.contract` draws the rows. `composer.contract` is the composer. `types.contract` has the shared shapes, styles and keyframes. `app.ts` is the data module; `model.ts` has the people, their seeded conversations and the saved file's shape. `app.test.contract` drives the UI on every host; `app.test.mjs` tests saving with `bun test`. `art/AppIcon.icon` is the icon for iOS and macOS, `assets/icon.png` for the web.

## Adapt

- People and history: `contacts` and `seedConversation` in `model.ts`. A real service replaces `answer` in `app.ts`; the contract reads it through `loadInbox` and writes through `command`.
- To drop a feature, delete its piece and the state only it uses: the peek (`conversation-peek`, `peek`, `resetPeeked`, the rows' `contextmenu`), the + card (`add-menu`, `receive`, `toggleTyping`, the `Card*` styles), the send's flight (the `flight*` states, `animate`, `send-flight`, `handOff`), earlier messages (`history`, the `conversation-menu` row).
- `app.json`'s `verify.accept` explains the two findings `bun exact.mjs verify` reports: the sent balloons' contrast and the field's height.

## Verified

`bun test`, `bun exact.mjs test web`, and `bun exact.mjs test ios` on an iPhone 18 Pro (iOS 27.0), an iPad Pro 11-inch (iOS 27.0) and an iPhone Duo (iOS 27.1, closed) simulator pass. An app made from this template with `new.mjs` passes `bun test`, `bun exact.mjs test web` and `bun exact.mjs test ios` on the iPhone and the iPad. The macOS, Linux and Android builds have not been run.

## Needs

Exact at `e3fac2586a` (branch `chat/messages-1123`, on `08677d8584`), which adds what the composer and the list rely on: the + card over the keyboard, glass that answers a finger around a field, the sidebar's lines and highlight, and the transcript's keyboard and inset handling. That branch is not on Exact's main yet.

## Limits

`QUEUE.md` has what is left to do. In short, a wrapped balloon is as wide as its maximum, not its longest line. The field grows only to its maximum height. Hardware and floating keyboards are untested. A held row in the iPad's sidebar shows no highlight. A popover opened from inside the + card by a control without glass, or a `popover="manual"` one, shows behind the card.
