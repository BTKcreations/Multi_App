import test from 'node:test';
import assert from 'node:assert';
import { loadFromStorage } from '../src/modules/storage.js';

test('loadFromStorage', async (t) => {
  const originalError = console.error;

  t.afterEach(() => {
    global.localStorage = undefined;
    console.error = originalError;
  });

  await t.test('returns parsed JSON for existing key', () => {
    global.localStorage = {
      getItem: (key) => {
        if (key === 'multiapp_test_key') {
          return JSON.stringify({ a: 1 });
        }
        return null;
      }
    };

    const result = loadFromStorage('test_key');
    assert.deepStrictEqual(result, { a: 1 });
  });

  await t.test('returns default value for missing key', () => {
    global.localStorage = {
      getItem: () => null
    };

    const result = loadFromStorage('missing_key', 'default_val');
    assert.strictEqual(result, 'default_val');
  });

  await t.test('returns default value if JSON.parse throws (invalid JSON)', () => {
    global.localStorage = {
      getItem: () => '{ invalid json'
    };

    let loggedError = null;
    console.error = (msg, err) => {
      loggedError = err;
    };

    const result = loadFromStorage('test_key', 'default_val');
    assert.strictEqual(result, 'default_val');
    assert.ok(loggedError instanceof SyntaxError);
  });

  await t.test('returns default value if localStorage.getItem throws', () => {
    global.localStorage = {
      getItem: () => {
        throw new Error('Access denied');
      }
    };

    let loggedError = null;
    console.error = (msg, err) => {
      loggedError = err;
    };

    const result = loadFromStorage('test_key', 'default_val');
    assert.strictEqual(result, 'default_val');
    assert.strictEqual(loggedError.message, 'Access denied');
  });
});
