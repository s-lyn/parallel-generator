/* global describe, it */
const assert = require('assert')
const sinon = require('sinon')
const { all, call } = require('../src/index')

describe('all()', function () {
  it('should allow to execute without calls', async function () {
    const iterator = all([])
    const next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
  })
  it('should exec sync calls', async function () {
    // Create stub
    const stub = sinon.stub()
    stub.onCall(0).returns('One')
    stub.onCall(1).returns('Two')
    const iterator = all([
      call(stub, 'arg1'),
      call(stub, 'arg1', 'arg2')
    ])
    let next = await iterator.next()
    assert.strictEqual(next.value, 'One')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, 'Two')
    assert.strictEqual(next.done, false)
    next = await iterator.next()
    assert.strictEqual(next.value, undefined)
    assert.strictEqual(next.done, true)
    // Check stub
    assert.ok(stub.calledTwice)
    assert.deepStrictEqual(stub.firstCall.args, ['arg1'])
    assert.deepStrictEqual(stub.secondCall.args, ['arg1', 'arg2'])
  })
  it('should exec async tasks', async function () {
    // Create stub
    const async1 = async function () { return 'One' }
    const async2 = async function () { return 'Two' }
    const iterator = all([
      call(async1),
      call(async2)
    ])
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
    const callback = (data, delay = 0) => {
      return new Promise(resolve => setTimeout(() => resolve(data), delay))
    }
    const tasks = [
      call(callback, 'One', 10),
      call(callback, 'Two', 0)
    ]
    const iterator = all(tasks)
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
    const iterator = all([
      call(() => { throw new Error('Test error') }),
      call(() => Promise.reject(new Error('Test error2'))),
      call(() => Promise.resolve('Two'))
    ])
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
})
