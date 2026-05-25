import { test } from 'node:test';
import assert from 'node:assert';
import { searchApps } from '../src/modules/search.js';

const mockApps = [
  {
    name: 'App 1',
    description: 'A great app for testing',
    category: 'Productivity',
    tags: ['test', 'app', 'great']
  },
  {
    name: 'Toolbox',
    description: 'Various tools',
    category: 'Utilities',
    tags: ['tool', 'box']
  },
  {
    name: 'Minimal App'
    // Missing description, category, and tags to test edge cases
  }
];

test('searchApps - empty or falsy queries return all apps', (t) => {
  assert.deepStrictEqual(searchApps(mockApps, ''), mockApps);
  assert.deepStrictEqual(searchApps(mockApps, '   '), mockApps);
  assert.deepStrictEqual(searchApps(mockApps, null), mockApps);
  assert.deepStrictEqual(searchApps(mockApps, undefined), mockApps);
});

test('searchApps - empty apps array returns empty array', (t) => {
  assert.deepStrictEqual(searchApps([], 'test'), []);
});

test('searchApps - matches by name', (t) => {
  const results = searchApps(mockApps, 'App 1');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'App 1');
});

test('searchApps - matches by description', (t) => {
  const results = searchApps(mockApps, 'testing');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'App 1');
});

test('searchApps - matches by category', (t) => {
  const results = searchApps(mockApps, 'Utilities');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Toolbox');
});

test('searchApps - matches by tags', (t) => {
  const results = searchApps(mockApps, 'box');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Toolbox');
});

test('searchApps - case insensitive matching', (t) => {
  const results = searchApps(mockApps, 'tOoLbOx');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Toolbox');
});

test('searchApps - handles missing properties (edge case)', (t) => {
  const results = searchApps(mockApps, 'minimal');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Minimal App');
});

test('searchApps - no matches returns empty array', (t) => {
  const results = searchApps(mockApps, 'Nonexistent');
  assert.strictEqual(results.length, 0);
});

test('searchApps - handles special characters in query', (t) => {
  const appsWithSpecialChars = [
    { name: 'App @#$!', description: 'Has special chars' }
  ];
  const results = searchApps(appsWithSpecialChars, '@#$!');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'App @#$!');
});

test('searchApps - ignores leading and trailing spaces in query', (t) => {
  const results = searchApps(mockApps, '  Toolbox  ');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Toolbox');
});
