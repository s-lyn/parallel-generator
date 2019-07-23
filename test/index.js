/* global describe, it */
const assert = require('assert')
const sinon = require('sinon')
const { parallel, call } = require('../src/index')

describe('parallel()', function () {
  it('should allow to execute without tasks', async function () {
    const iterator = parallel([])
    const next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
  })
  it('should exec sync tasks', async function () {
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
  it('should exec async tasks', async function () {
    const tasks = [
      call(() => Promise.resolve('One')),
      call(() => Promise.resolve('Two'))
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
  it('should call ordered', async function () {
    const tasks = [
      call(() => new Promise(resolve => setTimeout(() => resolve('One'), 10))),
      call(() => new Promise(resolve => setTimeout(() => resolve('Two'), 0)))
    ]
    const iterator = parallel(tasks)
    let next = await iterator.next()
    assert.strictEqual(next.value, 'Two')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, 'One')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
  })
  it('should support errors', async function () {
    const tasks = [
      call(() => { throw new Error('Test error') }),
      call(() => Promise.reject(new Error('Test error2'))),
      call(() => Promise.resolve('Two'))
    ]
    const iterator = parallel(tasks)
    let next = await iterator.next()
    assert.ok(next.value instanceof Error)
    assert.strictEqual(next.value.message, 'Test error')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.ok(next.value instanceof Error)
    assert.strictEqual(next.value.message, 'Test error2')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, 'Two')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
  })
  it('should support repeat calls', async function () {
    // Create stub
    const stub = sinon.stub()
    stub.onCall(0).throws(new Error('Test error'))
    stub.onCall(1).returns('OK')
    // Call parallel
    const iterator = parallel([
      call(stub).repeat(2)
    ])
    let next = await iterator.next()
    assert.strictEqual(next.value, 'OK')
    assert.strictEqual(next.done, false)
    assert.ok(stub.calledTwice)
  })
  it('should support repeat calls - #call() options', async function () {
    // Create stub
    const stub = sinon.stub()
    stub.onCall(0).throws(new Error('Test error'))
    stub.onCall(1).returns('OK')
    // Call parallel
    const iterator = parallel([
      call(stub, { repeat: 2 })
    ])
    let next = await iterator.next()
    assert.strictEqual(next.value, 'OK')
    assert.strictEqual(next.done, false)
    assert.ok(stub.calledTwice)
  })
})
