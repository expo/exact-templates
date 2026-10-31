import { describe, expect, test } from 'bun:test';
import { answer } from './app.ts';
import { seedConversation, seedStore } from './model.ts';

describe('conversation storage', () => {
  const thread = async (memory, id) => (await answer('loadInbox', [], {}, memory.api)).find((item) => item.id === id);

  test('a send preserves line breaks and replies, and IDs survive deletion', async () => {
    const memory = storage();
    const first = await answer('command', ['send', 'alex', 'First line\nSecond line', 'A quoted message', 1000], {}, memory.api);
    expect(first).toEqual({ id: 'sent-1', error: '' });
    const saved = await thread(memory, 'alex');
    expect(saved.messages.at(-1)).toMatchObject({ body: 'First line\nSecond line', reply: 'A quoted message' });
    await answer('command', ['delete', 'alex', first.id, '', 1001], {}, memory.api);
    const next = await answer('command', ['receive', 'alex', 'A new reply', '', 1002], {}, memory.api);
    expect(next.id).toBe('received-2');
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
    expect((await thread(memory, 'alex')).messages).toHaveLength(12);
  });

  test('prepending history is idempotent and preserves the newest messages', async () => {
    const memory = storage();
    await answer('command', ['send', 'alex', 'The newest message', '', 1000], {}, memory.api);
    await answer('command', ['history', 'alex', '', '', 1001], {}, memory.api);
    await answer('command', ['history', 'alex', '', '', 1002], {}, memory.api);
    const saved = await thread(memory, 'alex');
    expect(saved.messages).toHaveLength(253);
    expect(saved.messages.at(-1).body).toBe('The newest message');
    expect(saved.messages[239].endsRun).toBe(true);
    expect(saved.messages[240].stamped).toBe(true);
  });

  test('each person has a conversation, the most recent first', async () => {
    const memory = storage();
    const people = await answer('loadInbox', [], {}, memory.api);
    expect(people.map((item) => item.id)).toEqual(['alex', 'priya', 'jordan']);
    await answer('command', ['send', 'jordan', 'On my way', '', 1_792_700_000_000], {}, memory.api);
    const after = await answer('loadInbox', [], {}, memory.api);
    expect(after.map((item) => item.id)).toEqual(['jordan', 'alex', 'priya']);
    expect(after[0].messages.at(-1).body).toBe('On my way');
    expect(after[1].messages).toHaveLength(12);
  });

  test('a draft is saved with its conversation alone, and a reset leaves the others', async () => {
    const memory = storage();
    await answer('command', ['draft', 'priya', 'Half written', 'Morning! Did the package arrive?', 1000], {}, memory.api);
    await answer('command', ['send', 'alex', 'Hello', '', 1001], {}, memory.api);
    expect(await thread(memory, 'priya')).toMatchObject({ draft: 'Half written', reply: 'Morning! Did the package arrive?' });
    expect(await thread(memory, 'alex')).toMatchObject({ draft: '', reply: '' });
    await answer('command', ['reset', 'priya', '', '', 1002], {}, memory.api);
    expect(await thread(memory, 'priya')).toMatchObject({ draft: '' });
    expect((await thread(memory, 'alex')).messages.at(-1).body).toBe('Hello');
  });

  test('writes that overlap are applied in turn', async () => {
    const memory = storage();
    await Promise.all([
      answer('command', ['draft', 'alex', 'Typing', '', 1000], {}, memory.api),
      answer('command', ['send', 'alex', 'Sent', '', 1001], {}, memory.api),
    ]);
    const alex = await thread(memory, 'alex');
    expect(alex.draft).toBe('Typing');
    expect(alex.messages.at(-1).body).toBe('Sent');
  });

  test('a file of the first version becomes the conversation with Alex', async () => {
    const first = seedConversation('alex');
    first.messages.push({ id: 'sent-1', body: 'Kept', mine: true, at: 1000, reply: '', stamp: '', receipt: '' });
    first.serial = 1;
    const memory = storage(JSON.stringify(first));
    expect((await thread(memory, 'alex')).messages.at(-1).body).toBe('Kept');
    expect(await thread(memory, 'priya')).toBeDefined();
  });

  test('a conversation not in the list is refused without a write', async () => {
    const memory = storage();
    const reply = await answer('command', ['send', 'nobody', 'Hello', '', 1000], {}, memory.api);
    expect(reply.error).toContain('no longer in the list');
    expect(memory.contents).toBeUndefined();
  });
});

function storage(initial) {
  const memory = { contents: initial, failWrites: false, api: undefined };
  memory.api = {
    fs: {
      async readFile() {
        if (memory.contents === undefined) {
          throw Object.assign(new Error('No conversation has been saved'), { code: 'ENOENT' });
        }
        return new TextEncoder().encode(memory.contents).buffer;
      },
      async atomicWriteFile(_path, bytes) {
        if (memory.failWrites) {
          throw new Error('The storage device is full');
        }
        memory.contents = new TextDecoder().decode(bytes);
      },
    },
  };
  return memory;
}
