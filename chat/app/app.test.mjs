import { describe, expect, test } from 'bun:test';
import { answer, overlay } from './app.ts';
import { kept, loadMore, seedConversation, seedStore, snippet, viewing } from './model.ts';

describe('conversation storage', () => {
  const thread = async (memory, id) => (await answer('loadInbox', [], {}, memory.api)).find((item) => item.id === id);
  const transcript = (memory, id, start = '', end = '') => answer('loadTranscript', [id, start, end], {}, memory.api);

  test('a send preserves line breaks and replies, and IDs survive deletion', async () => {
    const memory = storage();
    const first = await answer('command', ['send', 'alex', 'First line\nSecond line', 'A quoted message', 1000], {}, memory.api);
    expect(first).toEqual({ id: 'sent-1', error: '' });
    const saved = await thread(memory, 'alex');
    expect(saved.recent.at(-1)).toMatchObject({ body: 'First line\nSecond line', reply: 'A quoted message' });
    await answer('command', ['delete', 'alex', first.id, '', 1001], {}, memory.api);
    const next = await answer('command', ['receive', 'alex', 'A new reply', '', 1002], {}, memory.api);
    expect(next.id).toBe('received-2');
  });

  test('the sources that answer together at launch read the saved files once', async () => {
    const memory = fresh(storage(JSON.stringify(seedStore())));
    let reads = 0;
    const readFile = memory.api.fs.readFile;
    memory.api.fs.readFile = (path) => {
      reads += 1;
      return readFile(path);
    };
    const [threads, part] = await Promise.all([answer('loadInbox', [], {}, memory.api), transcript(memory, 'alex'), answer('searchMessages', ['coffee'], {}, memory.api)]);
    expect(threads).toHaveLength(3);
    expect(part.rows.at(-1).id).toBe('seed-12');
    // The conversations' file and the drafts' file
    expect(reads).toBe(2);
  });

  test('a failed atomic write leaves the previous conversation intact', async () => {
    const initial = JSON.stringify(seedStore());
    const memory = storage(initial);
    memory.failWrites = true;
    const reply = await answer('command', ['send', 'alex', 'Keep this draft', '', 1000], {}, memory.api);
    expect(reply.id).toBe('');
    expect(reply.error).toContain('Your draft is kept; try again.');
    expect(memory.contents).toBe(initial);
  });

  test('unreadable saved data is preserved until an explicit reset', async () => {
    const memory = storage('{invalid json');
    await expect(answer('loadInbox', [], {}, memory.api)).rejects.toThrow();
    const refused = await answer('command', ['send', 'alex', 'Do not overwrite', '', 1000], {}, memory.api);
    expect(refused.error).not.toBe('');
    expect(memory.contents).toBe('{invalid json');
    const reset = await answer('command', ['reset', 'alex', '', '', 1000], {}, memory.api);
    expect(reset.error).toBe('');
    expect((await thread(memory, 'alex')).count).toBe(12);
  });

  test('prepending history is idempotent and preserves the newest messages', async () => {
    const memory = storage();
    await answer('command', ['send', 'alex', 'The newest message', '', 1000], {}, memory.api);
    await answer('command', ['history', 'alex', '', '', 1001], {}, memory.api);
    await answer('command', ['history', 'alex', '', '', 1002], {}, memory.api);
    const saved = await thread(memory, 'alex');
    expect(saved.count).toBe(253);
    expect(saved.recent).toHaveLength(viewing);
    expect(saved.recent.at(-1).body).toBe('The newest message');
    // The last of the earlier messages and the first seeded one, decorated as their neighbours say
    const seam = await transcript(memory, 'alex', saved.earlier);
    expect(seam.rows[239 - (253 - viewing - loadMore)].endsRun).toBe(true);
    expect(seam.rows[240 - (253 - viewing - loadMore)].stamped).toBe(true);
  });

  test('a transcript opens at its latest messages and loads more at each edge, holding at most its window', async () => {
    // A conversation of more than two windows, so that loading at one edge lets go of the other
    const store = seedStore();
    const alex = store.conversations.alex;
    const first = alex.messages[0];
    const older = Array.from({ length: 2 * kept }, (_, index) => ({ ...first, id: `older-${index}`, at: first.at - (2 * kept - index) * 60_000 }));
    store.conversations.alex = { ...alex, messages: [...older, ...alex.messages] };
    const memory = storage(JSON.stringify(store));
    const latest = await transcript(memory, 'alex');
    expect(latest.count).toBe(2 * kept + alex.messages.length);
    expect(latest.rows).toHaveLength(viewing);
    expect(latest.rows.at(-1).last).toBe(true);
    expect([latest.hasEarlier, latest.hasLater]).toEqual([true, false]);
    // Earlier and earlier: each step `loadMore` more, until the window lets go of its end
    let part = latest, start = '', end = '';
    const sizes = [];
    while (part.hasEarlier) {
      [start, end] = [part.earlier, part.earlierEnd];
      part = await transcript(memory, 'alex', start, end);
      sizes.push(part.rows.length);
      expect(part.rows.length).toBeLessThanOrEqual(kept);
    }
    const growing = Array.from({ length: (kept - viewing) / loadMore }, (_, index) => viewing + (index + 1) * loadMore);
    expect(sizes.slice(0, growing.length + 1)).toEqual([...growing, kept]);
    expect(part.rows[0].id).toBe('older-0');
    expect(part.rows[0].stamped).toBe(true);
    expect(part.hasLater).toBe(true);
    // And later again, to the end, which the window then follows
    while (part.hasLater) {
      part = await transcript(memory, 'alex', part.laterStart, part.later);
      expect(part.rows.length).toBeLessThanOrEqual(kept);
    }
    expect(part.rows.at(-1).id).toBe('seed-12');
    expect(part.later).toBe('');
  });

  test('a window whose first message was deleted begins at the one sent before it', async () => {
    const memory = storage();
    await answer('command', ['history', 'alex', '', '', 1000], {}, memory.api);
    const latest = await transcript(memory, 'alex');
    const start = latest.earlier, id = start.slice(start.indexOf('|') + 1);
    const before = await transcript(memory, 'alex', start);
    expect(before.rows[0].id).toBe(id);
    await answer('command', ['delete', 'alex', id, '', 1001], {}, memory.api);
    const after = await transcript(memory, 'alex', start);
    expect(after.rows[0].id).not.toBe(id);
    expect(after.rows[0].at).toBeLessThanOrEqual(before.rows[0].at);
  });

  test('each person has a conversation, the most recent first', async () => {
    const memory = storage();
    const people = await answer('loadInbox', [], {}, memory.api);
    expect(people.map((item) => item.id)).toEqual(['alex', 'priya', 'jordan']);
    await answer('command', ['send', 'jordan', 'On my way', '', 1_792_700_000_000], {}, memory.api);
    const after = await answer('loadInbox', [], {}, memory.api);
    expect(after.map((item) => item.id)).toEqual(['jordan', 'alex', 'priya']);
    expect(after[0].recent.at(-1).body).toBe('On my way');
    expect(after[1].count).toBe(12);
  });

  test('a draft is saved apart from the messages, with its conversation alone, and a reset leaves the others', async () => {
    const memory = storage();
    await answer('command', ['draft', 'priya', 'Half written', 'Morning! Did the package arrive?', 1000], {}, memory.api);
    expect(memory.contents).toBeUndefined();
    expect(JSON.parse(memory.files.get('app:/data/drafts.json')).drafts.priya.draft).toBe('Half written');
    expect(await thread(fresh(memory), 'priya')).toMatchObject({ draft: 'Half written' });
    await answer('command', ['send', 'alex', 'Hello', '', 1001], {}, memory.api);
    expect(await thread(memory, 'priya')).toMatchObject({ draft: 'Half written', reply: 'Morning! Did the package arrive?' });
    expect(await thread(memory, 'alex')).toMatchObject({ draft: '', reply: '' });
    await answer('command', ['reset', 'priya', '', '', 1002], {}, memory.api);
    expect(await thread(memory, 'priya')).toMatchObject({ draft: '' });
    expect((await thread(memory, 'alex')).recent.at(-1).body).toBe('Hello');
  });

  test('writes that overlap are applied in turn', async () => {
    const memory = storage();
    await Promise.all([
      answer('command', ['draft', 'alex', 'Typing', '', 1000], {}, memory.api),
      answer('command', ['send', 'alex', 'Sent', '', 1001], {}, memory.api),
    ]);
    const alex = await thread(memory, 'alex');
    expect(alex.draft).toBe('Typing');
    expect(alex.recent.at(-1).body).toBe('Sent');
  });

  test('a file of the first version becomes the conversation with Alex', async () => {
    const first = seedConversation('alex');
    first.messages.push({ id: 'sent-1', body: 'Kept', mine: true, at: 1000, reply: '', stamp: '', receipt: '' });
    first.serial = 1;
    const memory = storage(JSON.stringify(first));
    expect((await thread(memory, 'alex')).recent.at(-1).body).toBe('Kept');
    expect(await thread(memory, 'priya')).toBeDefined();
  });

  test('a send shows in its conversation before it is saved, under the id it is saved with', async () => {
    const memory = storage();
    const write = { id: 1, mutation: 'changed', source: 'command', args: ['send', 'priya', 'On my way', '', 1_792_700_000_000], answered: false, keep() {} };
    const shown = overlay('loadInbox', [], await answer('loadInbox', [], {}, memory.api), [write]);
    expect(shown[0].id).toBe('priya');
    expect(shown[0].serial).toBe(1);
    expect(shown[0].recent.at(-1)).toMatchObject({ id: 'sent-1', body: 'On my way', mine: true, last: true });
    expect(shown[0].recent.at(-2).last).toBe(false);
    expect(shown[0].count).toBe(5);
    // In a transcript's window that reaches the end too, and not in one that does not
    const part = await transcript(memory, 'priya', '0|seed-1');
    const windowed = overlay('loadTranscript', ['priya', '0|seed-1', ''], part, [write]);
    expect(windowed.rows.at(-1)).toMatchObject({ id: 'sent-1', last: true });
    expect(overlay('loadTranscript', ['priya', '0|seed-1', ''], { ...part, hasLater: true }, [write])).toBeUndefined();
    expect(await answer('command', write.args, {}, memory.api)).toEqual({ id: 'sent-1', error: '' });
    // Once an answer asked after the reply has it, the answer shows alone
    expect(overlay('loadInbox', [], await answer('loadInbox', [], {}, memory.api), [{ ...write, answered: true }])).toBeUndefined();
  });

  test('a conversation not in the list is refused without a write', async () => {
    const memory = storage();
    const reply = await answer('command', ['send', 'nobody', 'Hello', '', 1000], {}, memory.api);
    expect(reply.error).toContain('no longer in the list');
    expect(memory.contents).toBeUndefined();
  });
});

describe('message search', () => {
  test('a short message is whole, its match apart in its own case', () => {
    expect(snippet('Great, I’ll bring snacks.', 'SNACKS')).toEqual({ before: 'Great, I’ll bring ', match: 'snacks', after: '.' });
    expect(snippet('Great, I’ll bring snacks.', 'chips')).toBeNull();
  });

  test('a long message keeps the whole words within 100 characters of its match, an ellipsis where it was cut', () => {
    const words = Array.from({ length: 80 }, (_, index) => `word${index}`);
    words[40] = 'needle';
    const part = snippet(words.join(' '), 'needle');
    expect(part.match).toBe('needle');
    expect(part.before.startsWith('…')).toBe(true);
    expect(part.after.endsWith('…')).toBe(true);
    // Whole words only, each side about half the 200-character window
    expect(part.before.slice(1).split(' ').every((word) => word === '' || words.includes(word))).toBe(true);
    expect(part.after.slice(0, -1).split(' ').every((word) => word === '' || words.includes(word))).toBe(true);
    expect(Math.abs(part.before.length - 100)).toBeLessThan(10);
    expect(Math.abs(part.after.length - 100)).toBeLessThan(10);
  });

  test('a search finds messages in every conversation, the newest first, and an empty one finds none', async () => {
    const memory = storage();
    const results = await answer('searchMessages', ['YOU'], {}, memory.api);
    expect(results.length).toBeGreaterThan(1);
    expect(results.every((result) => result.match.toLowerCase() === 'you')).toBe(true);
    expect(results.map((result) => result.at)).toEqual(results.map((result) => result.at).toSorted((a, b) => b - a));
    expect(new Set(results.map((result) => result.thread)).size).toBe(3);
    expect(await answer('searchMessages', ['  '], {}, memory.api)).toEqual([]);
  });
});

/** Files by path, the conversations' as `contents`. */
function storage(initial) {
  const conversations = 'app:/data/conversation.json';
  const memory = { files: new Map(initial === undefined ? [] : [[conversations, initial]]), failWrites: false, api: undefined };
  Object.defineProperty(memory, 'contents', { get: () => memory.files.get(conversations) });
  memory.api = {
    fs: {
      async readFile(path) {
        if (!memory.files.has(path)) {
          throw Object.assign(new Error('No such file has been saved'), { code: 'ENOENT' });
        }
        return new TextEncoder().encode(memory.files.get(path)).buffer;
      },
      async atomicWriteFile(path, bytes) {
        if (memory.failWrites) {
          throw new Error('The storage device is full');
        }
        memory.files.set(path, new TextDecoder().decode(bytes));
      },
    },
  };
  return memory;
}

/** The same files as `memory`, read again as a new launch reads them. */
function fresh(memory) {
  const again = storage();
  again.files = memory.files;
  return again;
}
