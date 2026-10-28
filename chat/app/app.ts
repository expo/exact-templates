import type { Answer, Result, Sources, Storage } from './app.contract.d.ts';
import { contacts, earlierMessages, inbox, message, seedConversation, seedStore, upgrade, type Store } from './model';

export const appId = 'com.example.chat';
export const grants = 'fs.read app:/data/conversation.json\nfs.write app:/data/conversation.json';
const file = 'app:/data/conversation.json';

const sources: Sources = {
  loadInbox: async (_args, _store, storage): Promise<Result<'loadInbox'>> => inbox(await load(storage)),
  command: ([operation, contact, body, reply, at], _store, storage): Promise<Result<'command'>> => serially(async (): Promise<Result<'command'>> => {
    if (!contacts.some((known): boolean => known.id === contact)) {
      return { id: '', error: 'This conversation is no longer in the list. Go back to the list and choose another.' };
    }
    try {
      // Start a reset from the seeds when the saved file cannot be read, so it recovers from one
      const store = operation === 'reset' ? await load(storage).catch((): Store => seedStore()) : await load(storage);
      let conversation = store.conversations[contact]!;
      let id = '';
      switch (operation) {
        case 'send':
        case 'receive': {
          if (body.trim() === '') {
            return { id: '', error: 'Write a message before sending.' };
          }
          conversation.serial += 1;
          id = `${operation === 'send' ? 'sent' : 'received'}-${conversation.serial}`;
          conversation.messages.push(message(id, body, operation === 'send', at, reply));
          break;
        }
        case 'history': {
          if (!conversation.messages.some((item): boolean => item.id.startsWith('history-'))) {
            conversation.messages = [...earlierMessages(), ...conversation.messages];
          }
          break;
        }
        case 'draft': {
          conversation.draft = body;
          conversation.reply = reply;
          break;
        }
        case 'delete': {
          conversation.messages = conversation.messages.filter((item): boolean => item.id !== body);
          break;
        }
        case 'reset': {
          conversation = seedConversation(contact);
          break;
        }
        default:
          return { id: '', error: 'This conversation action is unavailable. Choose another action.' };
      }
      store.conversations[contact] = conversation;
      await storage.fs.atomicWriteFile(file, new TextEncoder().encode(JSON.stringify(store)));
      return { id, error: '' };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return { id: '', error: `The conversation could not be saved: ${detail}. Your draft is kept; try again.` };
    }
  }),
};

export const answer: Answer = (source, args, store, storage, native): ReturnType<Answer> =>
  sources[source](args, store, storage, native);

/** The commands' writes, one after another: each rewrites the whole file, so two at once would lose one's change. */
let last: Promise<unknown> = Promise.resolve();

function serially<T>(work: () => Promise<T>): Promise<T> {
  const run = last.then(work, work);
  last = run.catch((): void => {});
  return run;
}

async function load(storage: Storage): Promise<Store> {
  let bytes: ArrayBuffer;
  try {
    bytes = await storage.fs.readFile(file);
  } catch (e) {
    if ((e as { code?: string }).code === 'ENOENT') {
      return seedStore();
    }
    throw e;
  }
  const saved = upgrade(JSON.parse(new TextDecoder().decode(bytes)));
  if (saved === null) {
    throw new Error('The saved conversations have an unsupported format');
  }
  return saved;
}
