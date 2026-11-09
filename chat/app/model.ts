export interface Message {
  id: string;
  body: string;
  mine: boolean;
  at: number;
  reply: string;
  /** Whether the time heads it: the conversation's first message, or one sent an hour or more after the one before */
  stamped: boolean;
  endsRun: boolean;
  last: boolean;
  receipt: string;
  /** When it was read, for a receipt that says "Read" */
  readAt: number;
}

/** A message as it is saved: its stamp and where its run ends are derived when it is shown (`present`); files saved before read times have none. */
export type SavedMessage = Omit<Message, 'stamped' | 'endsRun' | 'last' | 'readAt'> & { readAt?: number };

/** A message sent this long after the one before it opens a new part of the conversation, headed by the time. */
const stampGap = 3_600_000;
/** A message sent more than this long after the one before it starts a new run of balloons, even from the same side. */
const runGap = 60_000;

export interface Conversation {
  version: 1;
  serial: number;
  messages: SavedMessage[];
  /** The unsent draft and the message it replies to; the first saved files have neither. */
  draft?: string;
  reply?: string;
}

export interface Contact {
  id: string;
  name: string;
  short: string;
  initials: string;
  /** Fictional: a number in 555-0100 to 555-0199, which North American numbering keeps for fiction, and an address at `.example` (RFC 2606). */
  phone: string;
  email: string;
}

/** A person in the list of conversations with their conversation, as the view reads it. */
export interface Thread extends Contact {
  draft: string;
  reply: string;
  /** How many messages were sent and received in it, deleted ones too: the next is numbered one more (`sent-<n>`) */
  serial: number;
  /** How many messages it holds */
  count: number;
  /** Its latest messages, as many as a transcript first shows (`viewing`), the oldest first */
  recent: Message[];
  /** Whether messages before `recent` remain, and the cursor of the window that loads `loadMore` of them (`window`) */
  hasEarlier: boolean;
  earlier: string;
}

/**
 * How many of a conversation's latest messages the list answers with it, which its transcript shows when it opens:
 * ChatKit's `initialConversationViewingMessageCount` (iOS 27.0).
 */
export const viewing = 50;
/** How many more messages a transcript loads at an edge it reaches: ChatKit's `defaultConversationLoadMoreCount`. */
export const loadMore = 50;
/** The most messages a transcript's window holds: loading at one edge lets go of the other's beyond them. */
export const kept = 200;

/**
 * Part of a conversation, as a transcript scrolled away from its latest messages shows it (LLP 1027.004): its rows,
 * and the cursors that load more before or after them. `earlier` and `later` are the new window's first and last
 * rows (`later` empty: the conversation's end, which then follows new messages), `earlierEnd` and `laterStart` its
 * other edge, so that it holds no more than `kept` rows.
 */
export interface Window {
  contact: string;
  rows: Message[];
  count: number;
  hasEarlier: boolean;
  earlier: string;
  earlierEnd: string;
  hasLater: boolean;
  later: string;
  laterStart: string;
}

/** Every conversation, by its contact's `id`, as it is saved. */
export interface Store {
  version: 2;
  conversations: Record<string, Conversation>;
}

export const contacts: Contact[] = [
  { id: 'alex', name: 'Alex Morgan', short: 'Alex', initials: 'AM', phone: '+1-415-555-0101', email: 'alex.morgan@mail.example' },
  { id: 'priya', name: 'Priya Shah', short: 'Priya', initials: 'PS', phone: '+1-415-555-0102', email: 'priya.shah@mail.example' },
  { id: 'jordan', name: 'Jordan Lee', short: 'Jordan', initials: 'JL', phone: '+1-415-555-0103', email: 'jordan.lee@mail.example' },
];

/** The seeded conversations: when each began, and how long after that its last sent message was read (0: not read). */
const seeds: Record<string, { start: number; read: number; bodies: [boolean, string][] }> = {
  alex: {
    start: 1_792_694_460_000,
    read: 300_000,
    bodies: [
      [false, 'Hey! Are you around this afternoon?'],
      [false, 'I was thinking we could grab a coffee.'],
      [true, 'Yes! I just have one thing to finish.'],
      [true, 'How does 3 sound?'],
      [false, 'Perfect. The little place on the corner?'],
      [true, 'The one with the really good pastries?'],
      [false, 'That’s the one ☺️'],
      [false, 'I’ll try to get us a table outside.'],
      [true, 'Love that. It’s such a nice day.'],
      [false, 'Also, remind me to show you the photos from the weekend.'],
      [true, 'Oh yes, I want to see those!'],
      [true, 'See you there 🙂'],
    ],
  },
  priya: {
    start: 1_792_688_700_000,
    read: 240_000,
    bodies: [
      [false, 'Morning! Did the package arrive?'],
      [true, 'It did, thank you so much!'],
      [false, 'Yay 🎉 Let me know if it fits.'],
      [true, 'Trying it on tonight. I’ll send a picture.'],
    ],
  },
  jordan: {
    start: 1_792_638_720_000,
    read: 0,
    bodies: [
      [true, 'Are we still on for the game on Saturday?'],
      [false, 'Absolutely. I’ll pick you up at 6.'],
      [true, 'Great, I’ll bring snacks.'],
      [false, 'Perfect, see you then!'],
    ],
  },
};

export function seedConversation(id: string): Conversation {
  const seed = seeds[id]!;
  const lastMine = seed.bodies.findLastIndex(([mine]): boolean => mine);
  return {
    version: 1,
    serial: 0,
    messages: seed.bodies.map(([mine, body], index): SavedMessage => {
      const read = mine && index === lastMine && seed.read > 0;
      return {
        ...message(`seed-${index + 1}`, body, mine, seed.start + index * 25_000),
        receipt: mine ? (read ? 'Read' : 'Delivered') : '',
        readAt: read ? seed.start + seed.read : 0,
      };
    }),
  };
}

export function seedStore(): Store {
  return { version: 2, conversations: Object.fromEntries(contacts.map((contact): [string, Conversation] => [contact.id, seedConversation(contact.id)])) };
}

/** The saved conversations as the list reads them: each contact's, with its latest messages, the most recent first. */
export function inbox(store: Store): Thread[] {
  return latestFirst(contacts.map((contact): Thread => {
    const conversation = store.conversations[contact.id];
    const messages = conversation?.messages ?? [];
    const lo = Math.max(0, messages.length - viewing);
    return {
      ...contact,
      draft: conversation?.draft ?? '',
      reply: conversation?.reply ?? '',
      serial: conversation?.serial ?? 0,
      count: messages.length,
      recent: present(messages, lo),
      hasEarlier: lo > 0,
      earlier: lo > 0 ? cursor(messages[Math.max(0, lo - loadMore)]!) : '',
    };
  }));
}

/** The threads, the one with the most recent message first. */
export function latestFirst(threads: Thread[]): Thread[] {
  const latest = (thread: Thread): number => thread.recent.at(-1)?.at ?? 0;
  return threads.sort((a, b): number => latest(b) - latest(a));
}

/**
 * The window of `contact`'s conversation from cursor `start` to cursor `end`: the latest `viewing` messages where
 * both are empty, from `start` to the end where only `end` is, and never more than `kept`. It reads only the rows it
 * answers and their neighbours, so its cost does not grow with the conversation's length.
 */
export function window(store: Store, contact: string, start: string, end: string): Window {
  const messages = store.conversations[contact]?.messages ?? [];
  const count = messages.length;
  let hi = end === '' ? count : Math.min(count, place(messages, end) + 1);
  let lo = start === '' ? Math.max(0, hi - viewing) : Math.min(place(messages, start), hi);
  if (hi - lo > kept) {
    // Cursors that name more than a window holds keep the edge that was named last
    if (end === '') {
      lo = hi - kept;
    } else {
      hi = lo + kept;
    }
  }
  const earlierLo = Math.max(0, lo - loadMore), earlierHi = Math.min(hi, earlierLo + kept);
  const laterHi = Math.min(count, hi + loadMore), laterLo = Math.max(lo, laterHi - kept);
  const at = (index: number): string => (index < count ? cursor(messages[index]!) : '');
  return {
    contact,
    rows: present(messages, lo, hi),
    count,
    hasEarlier: lo > 0,
    earlier: at(earlierLo),
    earlierEnd: earlierHi === count ? '' : at(earlierHi - 1),
    hasLater: hi < count,
    later: laterHi === count ? '' : at(laterHi - 1),
    laterStart: at(laterLo),
  };
}

/** A message's place in its conversation, as a window names it: when it was sent, and its id. */
function cursor(item: SavedMessage): string {
  return `${item.at}|${item.id}`;
}

/**
 * The index of the message a cursor names; for one deleted since, of the latest message sent no later than it was,
 * the first where none was (LLP 1027.004 D2).
 */
function place(messages: SavedMessage[], named: string): number {
  const bar = named.indexOf('|');
  const at = Number(named.slice(0, bar)), id = named.slice(bar + 1);
  const index = messages.findIndex((item): boolean => item.id === id);
  if (index >= 0 || !Number.isFinite(at)) {
    return Math.max(0, index);
  }
  return Math.max(0, messages.findLastIndex((item): boolean => item.at <= at));
}

/** A message a search found: its conversation, and its text trimmed around the match, with the match split out to be highlighted. */
export interface Found {
  key: string;
  thread: string;
  name: string;
  initials: string;
  message: string;
  at: number;
  mine: boolean;
  before: string;
  match: string;
  after: string;
}

/** The most messages a search answers, the newest: the list shows them all at once. */
export const searchLimit = 100;

/** The messages whose text holds `query`, case-insensitively, the newest first, at most `searchLimit` of them. */
export function found(store: Store, query: string): Found[] {
  const needle = query.trim();
  if (needle === '') {
    return [];
  }
  const results: Found[] = [];
  for (const contact of contacts) {
    const messages = store.conversations[contact.id]?.messages ?? [];
    // From each conversation's newest, as many as the answer can hold
    let kept = 0;
    for (let index = messages.length - 1; index >= 0 && kept < searchLimit; index -= 1) {
      const item = messages[index]!;
      const part = snippet(item.body, needle);
      if (part !== null) {
        kept += 1;
        results.push({
          key: `${contact.id}/${item.id}`, thread: contact.id, name: contact.name, initials: contact.initials,
          message: item.id, at: item.at, mine: item.mine, ...part,
        });
      }
    }
  }
  return results.sort((a, b): number => b.at - a.at).slice(0, searchLimit);
}

/**
 * A message's text around the first match of `needle`, as the platform trims a search result: a window of 200
 * characters centred on the match, widened to the whole words it reaches into, with an ellipsis on each side cut.
 * The match is split out, to be highlighted; null when there is none.
 */
export function snippet(body: string, needle: string): { before: string; match: string; after: string } | null {
  const hit = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'iu').exec(body);
  if (hit === null) {
    return null;
  }
  const end = hit.index + hit[0].length;
  const words = [...body.matchAll(/\S+/gu)].map((word): [number, number] => [word.index, word.index + word[0].length]);
  const first = words.findIndex(([, wordEnd]): boolean => wordEnd >= hit.index - 100);
  const last = words.findLastIndex(([wordStart]): boolean => wordStart <= end + 100);
  return {
    before: (first > 0 ? '…' : '') + body.slice(words[first]![0], hit.index),
    match: hit[0],
    after: body.slice(end, words[last]![1]) + (last < words.length - 1 ? '…' : ''),
  };
}

/** A saved file in either version, as the current one: the first version held Alex's conversation alone. */
export function upgrade(saved: unknown): Store | null {
  if (isConversation(saved)) {
    return { version: 2, conversations: withSeeds({ alex: saved }) };
  }
  if (typeof saved !== 'object' || saved === null || (saved as Partial<Store>).version !== 2) {
    return null;
  }
  const conversations = (saved as Partial<Store>).conversations;
  if (typeof conversations !== 'object' || conversations === null || !Object.values(conversations).every(isConversation)) {
    return null;
  }
  return { version: 2, conversations: withSeeds(conversations as Record<string, Conversation>) };
}

/** `saved` with each contact's seeded conversation where it has none: only those are seeded. */
function withSeeds(saved: Record<string, Conversation>): Record<string, Conversation> {
  return Object.fromEntries(contacts.map((contact): [string, Conversation] => [contact.id, saved[contact.id] ?? seedConversation(contact.id)]));
}

/** Messages `from` to `to` (exclusive) as the view reads them, each stamped and ending its run as its neighbours say, those outside the range included. */
export function present(messages: SavedMessage[], from = 0, to = messages.length): Message[] {
  const stamped = (index: number): boolean => index === 0 || messages[index]!.at - messages[index - 1]!.at >= stampGap;
  const endsRun = (index: number): boolean => {
    const next = messages[index + 1];
    return next === undefined || next.mine !== messages[index]!.mine || next.at - messages[index]!.at > runGap;
  };
  return messages.slice(from, to).map(({ id, body, mine, at, reply, receipt, readAt }, offset): Message => {
    const index = from + offset;
    return {
      id, body, mine, at, reply, receipt,
      readAt: readAt ?? 0,
      stamped: stamped(index),
      endsRun: endsRun(index),
      last: index === messages.length - 1,
    };
  });
}

/** `rows` with `item` sent after them, as `present` would show the two: the row before it ends its run as it says. */
export function append(rows: Message[], item: SavedMessage): Message[] {
  const before = rows.at(-1);
  if (before === undefined) {
    return present([item]);
  }
  const [previous, next] = present([before, item]);
  return [...rows.slice(0, -1), { ...before, endsRun: previous!.endsRun, last: false }, next!];
}

export function message(id: string, body: string, mine: boolean, at: number, reply = ''): SavedMessage {
  return { id, body, mine, at, reply, receipt: '', readAt: 0 };
}

export function earlierMessages(): SavedMessage[] {
  const samples = [
    'Did you get a chance to look at that place?',
    'I did! It looks lovely.',
    'Let’s make a plan for the weekend.',
    'Sounds good to me.\nSaturday or Sunday?',
    'Saturday works. I can head over after lunch.',
    'Perfect 👌',
  ];
  return Array.from({ length: 240 }, (_, index): SavedMessage => ({
    ...message(`history-${index}`, samples[index % samples.length]!, index % 4 >= 2, 1_792_608_060_000 + index * 30_000),
    receipt: index % 4 >= 2 ? 'Delivered' : '',
  }));
}

export function isConversation(value: unknown): value is Conversation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<Conversation>;
  return candidate.version === 1 && Number.isSafeInteger(candidate.serial) && candidate.serial! >= 0
    && ['undefined', 'string'].includes(typeof candidate.draft) && ['undefined', 'string'].includes(typeof candidate.reply)
    && Array.isArray(candidate.messages) && candidate.messages.every((item): boolean =>
      typeof item?.id === 'string' && typeof item.body === 'string' && typeof item.mine === 'boolean'
      && typeof item.at === 'number' && Number.isFinite(item.at) && typeof item.reply === 'string'
      && typeof item.receipt === 'string' && (item.readAt === undefined || (typeof item.readAt === 'number' && Number.isFinite(item.readAt))))
    && new Set(candidate.messages.map((item): string => item.id)).size === candidate.messages.length;
}
