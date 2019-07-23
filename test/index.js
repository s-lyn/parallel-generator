/* global describe, it */
const assert = require('assert')
const { parallel, call } = require('../src/index')

describe('parallel()', function () {
  it('should allow to execute without tasks', async function () {
    const iterator = parallel([])
    const next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
  })
  it.only('should exec sync tasks', async function () {
    const tasks = [
      call(() => 'One'),
      call(() => 'Two')
    ]
    const iterator = parallel(tasks)
    let next = await iterator.next()
    assert.strictEqual(next.value, 'One')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, 'Two')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
  })
})
