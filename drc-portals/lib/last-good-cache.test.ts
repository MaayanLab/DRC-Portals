import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLastGoodCache } from './last-good-cache'

test('retains successful data during outages and refreshes after recovery', async () => {
  const get = createLastGoodCache({ ttlMs: 0 })
  assert.equal(await get('data', async () => 'original'), 'original')
  assert.equal(await get('data', async () => { throw new Error('offline') }), 'original')
  assert.equal(await get('data', async () => 'unused', false), 'original')
  assert.equal(await get('data', async () => 'recovered'), 'recovered')
})

test('a cold outage does not cache failure or prevent later recovery', async () => {
  const get = createLastGoodCache()
  assert.equal(await get('data', async () => { throw new Error('offline') }), undefined)
  assert.equal(await get('data', async () => 42), 42)
})

test('fresh snapshots avoid duplicate queries and concurrent refreshes are shared', async () => {
  const get = createLastGoodCache()
  let calls = 0
  const load = async () => ++calls
  assert.deepEqual(await Promise.all([get('data', load), get('data', load)]), [1, 1])
  assert.equal(await get('data', load), 1)
  assert.equal(calls, 1)
})

test('hung refreshes return stale data within the timeout and allow recovery', async () => {
  const get = createLastGoodCache({ ttlMs: 0, timeoutMs: 10 })
  await get('data', async () => 'original')
  assert.equal(await get('data', () => new Promise<never>(() => {})), 'original')
  assert.equal(await get('data', async () => 'recovered'), 'recovered')
})
