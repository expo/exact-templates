# Chat

A chat app: a list of conversations, and a conversation's transcript over a composer that rides on the keyboard. Conversations and drafts are saved on the device; there is no server or account.

Keywords: chat, messaging, messenger, conversation, inbox, thread, transcript, message bubbles, balloons, tails, composer, text input over the keyboard, input accessory, keyboard avoidance, interactive keyboard dismissal, swipe down to dismiss the keyboard, virtualized list that follows its end, load earlier messages, typing indicator, read receipt, delivered, reply, swipe to reply, long-press menu, copy, delete, context menu, peek, preview, popover, Liquid Glass, glass group, blur under a bar, split view, sidebar, list and detail, drafts, local persistence.

![The list of conversations on an iPhone](screenshots/iphone-list.png)
![A conversation on an iPhone](screenshots/iphone-conversation.png)
![The list beside a conversation on an iPad](screenshots/ipad-split.png)

## What it shows, and where

| Behaviour | Where |
| --- | --- |
| The conversation list: avatar, name, when the last message was sent and the message itself, lines from the text, a long press that peeks at the conversation; at the accessibility text sizes no avatar | `app.contract`, the `inbox` route, `ConversationRow` and `id="conversation-peek"` |
| The bar's search field: the conversations whose name matches, then the messages whose text does, each in a balloon trimmed around its match to whole words, the match in a stronger colour; "No Results" over the empty list, above the keys while the search is typed in | `app.contract`, `searchChats`, `shown`, `matches` and `noResults`; `model.ts`, `found` and `snippet`; `app.ts`, `searchMessages` |
| List beside the conversation on an iPad, the iPhone Duo open, or a window 900 px wide; a pushed conversation on a phone | `app.contract`, `routes` and `follow`; the rows are links |
| A transcript that opens at its newest message and follows it, built only where it shows | `app.contract`, `list id="transcript"` (`virtualized`, `scroll-start="end"`, `scrollFollowEnd`) |
| 240 earlier messages put above the reader without moving what they read | `app.contract`, `action history` |
| Balloons with tails, grouped in runs from one side a minute or less apart, a one-letter balloon's text centred; the time stamp over a conversation's first message and after an hour's gap; the read receipt; the typing indicator | `bubble.contract`, `Balloon`, `MessageRow`, `stampDay`, `Typing`; `model.ts`, `present` |
| A message's long-press menu (copy, reply, delete) and swipe to reply | `bubble.contract`, `contextmenu` and `swiperight`; `app.contract`, `id="message-menu"` |
| A long press on the contact in the bar: their card, as wide as a row, with their avatar and name, over Call, Message, Video and Mail; Call, Video and Mail link to their fictional number and address | `app.contract`, the `contact` button's `contextPopover`, `id="contact-menu"`, `startMessage`; `model.ts`, `contacts`; `app.tamber`, the Call and Video icons off Apple |
| The composer: a growing field in a glass pill, a glass + beside it in one glass group, a blur behind the bar, Send | `composer.contract`, `Composer` |
| The composer on the keyboard, and the keys' interactive dismissal | `composer.contract`'s padding and comment; `keyboardDismissMode="interactive"` on the transcript |
| A flick down on the bar, or on its field while its text fits, putting the keys away (iOS; Android's fling and the Mac's three-finger swipe make it there too) | `composer.contract`, `swipe=hideKeys swipe-direction="down"` on `composer-bar`, `hideKeys` |
| The + card that opens over the keyboard | `app.contract`, `id="add-menu"`; `types.contract`, `CardRow`, `CardTile`, `CardGlyph` |
| A send's flight from under the field's glass to its row on the platform's springs, the message in the transcript from the send, before it is saved, the transcript scrolling to make room, the tail of the balloon before shrinking into it, and a received message popping in | `app.contract`, `action send`, `action animate`, `action rise`, `id="send-flight"`; `app.ts`, `overlay`; `types.contract`, `keyframes arrive` |
| Saving every conversation and its draft in one file, one write at a time | `app.ts`, `answer`; `model.ts`, the people and seeded conversations |

## Files

`app.contract` holds the routes, the conversation and its state, the send animation and the popovers. `bubble.contract` draws the rows. `composer.contract` is the composer. `types.contract` has the shared shapes, styles and keyframes. `app.ts` is the data module; `model.ts` has the people, their seeded conversations and the saved file's shape. `app.test.contract` drives the UI on every host; `app.test.mjs` tests saving with `bun test`. `art/AppIcon.icon` is the icon for iOS and macOS, `assets/icon.png` for the web.

## Adapt

- People and history: `contacts` and `seedConversation` in `model.ts`. A real service replaces `answer` in `app.ts`; the contract reads it through `loadInbox` and writes through `command`. `overlay` shows a sent message until the answer has it, under the id `answer` gives it: `sent-` and one more than the conversation's `serial`, which `action send` names too.
- To drop a feature, delete its piece and the state only it uses: the peek (`conversation-peek`, `peek`, `resetPeeked`, the rows' `contextmenu`), the contact's card (`contact-menu`, `startMessage`, the `contact` button's `contextPopover`), the + card (`add-menu`, `receive`, `toggleTyping`, the `Card*` styles), the send's flight (the `flight*` states, `animate`, `rise`, `send-flight`, `handOff`), earlier messages (`history`, the `conversation-menu` row).
- `app.json`'s `verify.accept` explains the two findings `bun exact.mjs verify` reports: the sent balloons' contrast and the field's height.

## Verified

`bun test`, `bun exact.mjs test web`, and `bun exact.mjs test ios` on an iPhone 18 Pro (iOS 27.0), an iPad Pro 11-inch (iOS 27.0) and an iPhone Duo (iOS 27.1, closed) simulator pass. An app made from this template with `new.mjs` passes `bun test`, `bun exact.mjs test web` and `bun exact.mjs test ios` on the iPhone and the iPad. The macOS, Linux and Android builds have not been run.

## Needs

Exact at `58b7467f14` (branch `chat/messages-1123` of github.com/ide/exact2, made from `08677d8584`), which adds what the composer and the list rely on: the + card over the keyboard, glass that answers a finger around a field, the sidebar's lines and its highlight, which stays in the tint while the app is in the background and moves to a conversation its peek opens, the selected row's text in the colours the platform's own selected cell takes, a row's peek, which lifts the row with its cell, in a sidebar's rounded shape on the sidebar's ground or across a phone's width past its side safe area, and grows into the conversation it opens in place of the open one, the contact's long press from the bar's title, links among a context menu's rows, the keys counted once in the safe area of a route whose search is in the bar and taken down from that bar's top, a held row's press, the transcript's keyboard, inset and rubber band handling, its glide to an end that moved up (a typing indicator hiding, a message deleted), a balloon's opacity set in the resize round that measures it, a composer that scrolls only once its text overflows, and a header avatar drawn with its gradient and rounded initials; and `verify`'s acceptance of a list row's finding by its templated testId. That branch is not on Exact's main yet.

## Limits

`QUEUE.md` has what is left to do. In short, a wrapped balloon is as wide as its maximum, not its longest line. The field grows only to its maximum height. Hardware and floating keyboards are untested. A popover opened from inside the + card by a control without glass, or a `popover="manual"` one, shows behind the card. Video is a FaceTime link, which only Apple devices open.
