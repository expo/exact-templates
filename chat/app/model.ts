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
  messages: Message[];
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

/** The saved conversations as the view reads them: each contact's, the most recent first. */
export function inbox(store: Store): Thread[] {
  return latestFirst(contacts.map((contact): Thread => {
    const conversation = store.conversations[contact.id];
    return {
      ...contact,
      draft: conversation?.draft ?? '',
      reply: conversation?.reply ?? '',
      serial: conversation?.serial ?? 0,
      messages: present(conversation?.messages ?? []),
    };
  }));
}

/** The threads, the one with the most recent message first. */
export function latestFirst(threads: Thread[]): Thread[] {
  const latest = (thread: Thread): number => thread.messages.at(-1)?.at ?? 0;
  return threads.sort((a, b): number => latest(b) - latest(a));
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

/** The messages whose text holds `query`, case-insensitively, the newest first. */
export function found(threads: Thread[], query: string): Found[] {
  const needle = query.trim();
  if (needle === '') {
    return [];
  }
  return threads
    .flatMap((thread): Found[] => thread.messages.flatMap((item): Found[] => {
      const part = snippet(item.body, needle);
      return part === null ? [] : [{
        key: `${thread.id}/${item.id}`, thread: thread.id, name: thread.name, initials: thread.initials,
        message: item.id, at: item.at, mine: item.mine, ...part,
      }];
    }))
    .sort((a, b): number => b.at - a.at);
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
    return { version: 2, conversations: { ...seedStore().conversations, alex: saved } };
  }
  if (typeof saved !== 'object' || saved === null || (saved as Partial<Store>).version !== 2) {
    return null;
  }
  const conversations = (saved as Partial<Store>).conversations;
  if (typeof conversations !== 'object' || conversations === null || !Object.values(conversations).every(isConversation)) {
    return null;
  }
  return { version: 2, conversations: { ...seedStore().conversations, ...conversations } };
}

export function present(messages: SavedMessage[]): Message[] {
  const stamped = (index: number): boolean => index === 0 || messages[index]!.at - messages[index - 1]!.at >= stampGap;
  const endsRun = (index: number): boolean => {
    const next = messages[index + 1];
    return next === undefined || next.mine !== messages[index]!.mine || next.at - messages[index]!.at > runGap;
  };
  return messages.map(({ id, body, mine, at, reply, receipt, readAt }, index): Message => ({
    id, body, mine, at, reply, receipt,
    readAt: readAt ?? 0,
    stamped: stamped(index),
    endsRun: endsRun(index),
    last: index === messages.length - 1,
  }));
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
