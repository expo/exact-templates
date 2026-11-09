import type { Answer, Overlay, Result, Sources, Storage } from './app.contract.d.ts';
import {
  append, contacts, earlierMessages, found, inbox, latestFirst, message, seedConversation, seedStore, upgrade, viewing, window,
  type Conversation, type SavedMessage, type Store, type Thread, type Window,
} from './model';

export const appId = 'com.example.chat';
export const grants = [
  'fs.read app:/data/conversation.json', 'fs.write app:/data/conversation.json',
  'fs.read app:/data/drafts.json', 'fs.write app:/data/drafts.json',
].join('\n');
/** Every conversation's messages, rewritten by a change to them. */
const file = 'app:/data/conversation.json';
/** Every conversation's unsent draft, apart from the messages, so that a key typed rewrites only the drafts. */
const draftsFile = 'app:/data/drafts.json';

const sources: Sources = {
  loadInbox: async (_args, _store, storage): Promise<Result<'loadInbox'>> => inbox(await load(storage)),
  loadTranscript: async ([contact, start, end], _store, storage): Promise<Result<'loadTranscript'>> =>
    window(await load(storage), contact, start, end),
  searchMessages: async ([query], _store, storage): Promise<Result<'searchMessages'>> => found(await load(storage), query),
  command: ([operation, contact, body, reply, at], _store, storage): Promise<Result<'command'>> => serially(async (): Promise<Result<'command'>> => {
    if (!contacts.some((known): boolean => known.id === contact)) {
      return { id: '', error: 'This conversation is no longer in the list. Go back to the list and choose another.' };
    }
    try {
      // Start a reset from the seeds when the saved file cannot be read, so it recovers from one
      const saved = operation === 'reset' ? await load(storage).catch((): Store => seedStore()) : await load(storage);
      const before = saved.conversations[contact]!;
      let conversation: Conversation = before;
      let id = '';
      switch (operation) {
        case 'send':
        case 'receive': {
          if (body.trim() === '') {
            return { id: '', error: 'Write a message before sending.' };
          }
          const serial = before.serial + 1;
          id = `${operation === 'send' ? 'sent' : 'received'}-${serial}`;
          conversation = { ...before, serial, messages: [...before.messages, message(id, body, operation === 'send', at, reply)] };
          break;
        }
        case 'history': {
          if (!before.messages.some((item): boolean => item.id.startsWith('history-'))) {
            conversation = { ...before, messages: [...earlierMessages(), ...before.messages] };
          }
          break;
        }
        case 'draft': {
          const store = { ...saved, conversations: { ...saved.conversations, [contact]: { ...before, draft: body, reply } } };
          await storage.fs.atomicWriteFile(draftsFile, new TextEncoder().encode(JSON.stringify(drafts(store))));
          cache.set(storage, store);
          return { id, error: '' };
        }
        case 'delete': {
          // The chosen messages' ids, one a line
          const chosen = new Set(body.split('\n'));
          conversation = { ...before, messages: before.messages.filter((item): boolean => !chosen.has(item.id)) };
          break;
        }
        case 'reset': {
          conversation = seedConversation(contact);
          break;
        }
        default:
          return { id: '', error: 'This conversation action is unavailable. Choose another action.' };
      }
      const store = { ...saved, conversations: { ...saved.conversations, [contact]: conversation } };
      await storage.fs.atomicWriteFile(file, new TextEncoder().encode(JSON.stringify(store)));
      if (operation === 'reset') {
        await storage.fs.atomicWriteFile(draftsFile, new TextEncoder().encode(JSON.stringify(drafts(store))));
      }
      cache.set(storage, store);
      return { id, error: '' };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return { id: '', error: `The conversation could not be saved: ${detail}. Your draft is kept; try again.` };
    }
  }),
};

export const answer: Answer = (source, args, store, storage, native): ReturnType<Answer> =>
  sources[source](args, store, storage, native);

/**
 * A sent message shows in its conversation from the send, before the file has it, under the id the send saves it
 * with, so the transcript makes room for it at once and its balloon flies to its row: in the list's latest messages,
 * and in a transcript's window that reaches the conversation's end. A send that failed is in no answer, so it goes
 * when the answer asked after its reply comes.
 */
export const overlay: Overlay = (source, args, answer, writes): ReturnType<Overlay> => {
  if (source !== 'loadInbox' && source !== 'loadTranscript') {
    return undefined;
  }
  const pending = new Map<string, { serial: number; sent: SavedMessage[] }>();
  const threads = source === 'loadInbox' ? answer as Thread[] : [];
  for (const write of writes) {
    if (write.answered || write.source !== 'command') {
      continue;
    }
    const [operation, contact, body, reply, at] = write.args;
    const thread = threads.find((item): boolean => item.id === contact);
    if ((operation !== 'send' && operation !== 'receive') || body.trim() === '' || (source === 'loadInbox' && thread === undefined)) {
      continue;
    }
    // A receive takes the next number too, though it shows only once saved
    const shown = pending.get(contact) ?? { serial: thread?.serial ?? 0, sent: [] };
    shown.serial += 1;
    if (operation === 'send') {
      shown.sent.push(message(`sent-${shown.serial}`, body, true, at, reply));
    }
    pending.set(contact, shown);
  }
  if (pending.size === 0) {
    return undefined;
  }
  if (source === 'loadTranscript') {
    const part = answer as Window;
    const shown = pending.get(String(args[0]));
    if (shown === undefined || shown.sent.length === 0 || part.hasLater) {
      return undefined;
    }
    return { ...part, count: part.count + shown.sent.length, rows: shown.sent.reduce(append, part.rows) } as never;
  }
  return latestFirst(threads.map((thread): Thread => {
    const shown = pending.get(thread.id);
    if (shown === undefined) {
      return thread;
    }
    const recent = shown.sent.reduce(append, thread.recent);
    return { ...thread, serial: shown.serial, count: thread.count + shown.sent.length, recent: recent.slice(-viewing) };
  })) as never;
};

/** The commands' writes, one after another: each rewrites a whole file, so two at once would lose one's change. */
let last: Promise<unknown> = Promise.resolve();

function serially<T>(work: () => Promise<T>): Promise<T> {
  const run = last.then(work, work);
  last = run.catch((): void => {});
  return run;
}

/**
 * The saved conversations as last written, by the storage that holds them: the files are read once, and each write
 * that lands replaces them, so an answer reads no file. A write that fails leaves them as they were.
 */
const cache = new WeakMap<Storage, Store>();

async function load(storage: Storage): Promise<Store> {
  const held = cache.get(storage);
  if (held !== undefined) {
    return held;
  }
  let bytes: ArrayBuffer;
  try {
    bytes = await storage.fs.readFile(file);
  } catch (e) {
    if ((e as { code?: string }).code === 'ENOENT') {
      const seeded = withDrafts(seedStore(), await readDrafts(storage));
      cache.set(storage, seeded);
      return seeded;
    }
    throw e;
  }
  const saved = upgrade(JSON.parse(new TextDecoder().decode(bytes)));
  if (saved === null) {
    throw new Error('The saved conversations have an unsupported format');
  }
  const store = withDrafts(saved, await readDrafts(storage));
  cache.set(storage, store);
  return store;
}

/** Each conversation's draft and the message it replies to, as the drafts file holds them. */
type Drafts = Record<string, { draft: string; reply: string }>;

function drafts(store: Store): { version: 1; drafts: Drafts } {
  return {
    version: 1,
    drafts: Object.fromEntries(Object.entries(store.conversations).map(([id, item]): [string, { draft: string; reply: string }] =>
      [id, { draft: item.draft ?? '', reply: item.reply ?? '' }])),
  };
}

/** The drafts file's drafts, none where there is no file yet: the conversations' own, saved before it, stand. */
async function readDrafts(storage: Storage): Promise<Drafts | null> {
  try {
    const saved = JSON.parse(new TextDecoder().decode(await storage.fs.readFile(draftsFile))) as { version?: number; drafts?: Drafts };
    return saved.version === 1 && typeof saved.drafts === 'object' && saved.drafts !== null ? saved.drafts : null;
  } catch (e) {
    if ((e as { code?: string }).code === 'ENOENT') {
      return null;
    }
    throw e;
  }
}

function withDrafts(store: Store, saved: Drafts | null): Store {
  if (saved === null) {
    return store;
  }
  return {
    ...store,
    conversations: Object.fromEntries(Object.entries(store.conversations).map(([id, item]): [string, Conversation] => {
      const draft = saved[id];
      return [id, draft === undefined ? item : { ...item, draft: String(draft.draft ?? ''), reply: String(draft.reply ?? '') }];
    })),
  };
}
