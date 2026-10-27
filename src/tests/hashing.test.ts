import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeHashAction,
  generateRehashSteps,
  computeHash,
  getNextPrime,
  type HashTableState,
} from '../algorithms/hashing/hashTable';

test('Hashing (Chaining): never loses keys through collisions', () => {
  let table: HashTableState = {
    size: 5,
    count: 0,
    loadFactor: 0,
    strategy: 'chaining',
    hashFunction: 'division',
    buckets: new Array(5).fill(null).map(() => []),
  };

  // Keys 5, 10, 15, 20 all hash to index 0 (mod 5 == 0)
  const collisionKeys = [5, 10, 15, 20];
  for (const k of collisionKeys) {
    const res = executeHashAction(table, 'insert', k);
    table = res.table;
  }

  assert.equal(table.count, 4);

  // Search each key: must all be found in bucket 0
  for (const k of collisionKeys) {
    const res = executeHashAction(table, 'search', k);
    const lastStep = res.steps[res.steps.length - 1];
    assert.equal(lastStep.type, 'found', `Key ${k} should be found despite collisions`);
    assert.equal(lastStep.auxiliary?.foundIndex, 0);
  }
});

test('Hashing (Linear Probing): passes through tombstones upon delete and continues search', () => {
  let table: HashTableState = {
    size: 7,
    count: 0,
    loadFactor: 0,
    strategy: 'linear_probing',
    hashFunction: 'division',
    buckets: new Array(7).fill(null),
  };

  // Insert 7, 14, 21 (all hash to 0 mod 7)
  // 7 placed at [0], 14 placed at [1], 21 placed at [2]
  table = executeHashAction(table, 'insert', 7).table;
  table = executeHashAction(table, 'insert', 14).table;
  table = executeHashAction(table, 'insert', 21).table;

  // Delete middle element 14 -> leaves a DELETED TOMBSTONE at [1]
  table = executeHashAction(table, 'delete', 14).table;
  const deletedSlot = table.buckets[1] as any;
  assert.equal(deletedSlot?.isTombstone, true);

  // Search for 21: MUST NOT terminate at slot [1], must pass tombstone and find 21 at slot [2]!
  const searchRes = executeHashAction(table, 'search', 21);
  const foundStep = searchRes.steps.find(s => s.type === 'found');
  assert.ok(foundStep, 'Search must pass through tombstone to find subsequent key in probe chain');
  assert.equal(foundStep?.auxiliary?.foundIndex, 2);
});

test('Hashing (Quadratic Probing): offsets by index = (h + i*i) mod m on collision', () => {
  let table: HashTableState = {
    size: 7,
    count: 0,
    loadFactor: 0,
    strategy: 'quadratic_probing',
    hashFunction: 'division',
    buckets: new Array(7).fill(null),
  };

  // Insert 7 (base 0) -> probe 0: (0 + 0) mod 7 = 0
  table = executeHashAction(table, 'insert', 7).table;
  assert.equal((table.buckets[0] as any)?.key, 7);

  // Insert 14 (base 0) -> probe 0 collides; probe 1: (0 + 1^2) mod 7 = 1 -> placed at slot 1
  table = executeHashAction(table, 'insert', 14).table;
  assert.equal((table.buckets[1] as any)?.key, 14);

  // Insert 21 (base 0) -> probe 0 collides (7), probe 1 collides (14); probe 2: (0 + 2^2) mod 7 = 4 -> placed at slot 4!
  table = executeHashAction(table, 'insert', 21).table;
  assert.equal((table.buckets[4] as any)?.key, 21);

  // Verify search finds all three at their quadratic probe slots
  const s7 = executeHashAction(table, 'search', 7);
  assert.equal(s7.steps.find(s => s.type === 'found')?.auxiliary?.foundIndex, 0);

  const s14 = executeHashAction(table, 'search', 14);
  assert.equal(s14.steps.find(s => s.type === 'found')?.auxiliary?.foundIndex, 1);

  const s21 = executeHashAction(table, 'search', 21);
  assert.equal(s21.steps.find(s => s.type === 'found')?.auxiliary?.foundIndex, 4);
});

test('Hashing: Insert into full table stops with "Table full: rehash required", search/delete stops after m probes', () => {
  const m = 3;
  let table: HashTableState = {
    size: m,
    count: 0,
    loadFactor: 0,
    strategy: 'linear_probing',
    hashFunction: 'division',
    buckets: new Array(m).fill(null),
  };

  // Fill all 3 slots
  table = executeHashAction(table, 'insert', 10).table;
  table = executeHashAction(table, 'insert', 11).table;
  table = executeHashAction(table, 'insert', 12).table;
  assert.equal(table.count, 3);

  // Attempt to insert 4th element into full table
  const insertFullRes = executeHashAction(table, 'insert', 13);
  const lastInsertStep = insertFullRes.steps[insertFullRes.steps.length - 1];
  assert.ok(
    lastInsertStep.description.includes('Table full: rehash required'),
    'Insert into full table must yield "Table full: rehash required"'
  );

  // Search for missing key in full table must stop after m probes
  const searchFullRes = executeHashAction(table, 'search', 99);
  const lastSearchStep = searchFullRes.steps[searchFullRes.steps.length - 1];
  assert.ok(
    lastSearchStep.description.includes('Search stopped after 3 probes'),
    'Search must stop after m probes'
  );
});

test('Hashing: Rehash doubles capacity to next prime and re-inserts all active keys', () => {
  let table: HashTableState = {
    size: 7,
    count: 0,
    loadFactor: 0,
    strategy: 'linear_probing',
    hashFunction: 'division',
    buckets: new Array(7).fill(null),
  };

  const keys = [10, 20, 30, 40, 50, 60]; // load factor 6/7 = 0.857 >= 0.75
  for (const k of keys) {
    table = executeHashAction(table, 'insert', k).table;
  }
  assert.ok(table.loadFactor >= 0.75);

  const nextPrime = getNextPrime(7 * 2); // 14 -> 17
  assert.equal(nextPrime, 17);

  const rehashResult = generateRehashSteps(table);
  const newTable = rehashResult.table;

  assert.equal(newTable.size, 17);
  assert.equal(newTable.count, 6);
  assert.ok(newTable.loadFactor < 0.75);

  // Verify all keys exist in new table
  for (const k of keys) {
    const s = executeHashAction(newTable, 'search', k);
    assert.ok(s.steps.find(step => step.type === 'found'), `Key ${k} must be found in rehashed table`);
  }
});

test('Hashing: Hash function options (division, multiplication, string_poly) produce valid bounded outputs', () => {
  const m = 11;
  const divRes = computeHash(45, m, 'division');
  assert.equal(divRes.index, 45 % 11);

  const multRes = computeHash(45, m, 'multiplication');
  assert.ok(multRes.index >= 0 && multRes.index < m);

  const polyRes = computeHash('algorithm', m, 'string_poly');
  assert.ok(polyRes.index >= 0 && polyRes.index < m);
});
