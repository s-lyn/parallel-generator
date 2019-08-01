const isPromise = require('is-promise')

function call (fn, ...args) {
  return {
    CALL: {
      fn,
      args
    }
  }
}

const isCall = (object) => {
  return typeof object === 'object' &&
    typeof object.CALL === 'object' &&
    typeof object.CALL.fn === 'function' &&
    Array.isArray(object.CALL.args)
}

const isGenerator = fn => {
  return typeof fn === 'function' &&
    ['GeneratorFunction', 'AsyncGeneratorFunction'].includes(fn.constructor.name)
}

async function callToPromise (call, callIndex, iterator) {
  if (!isCall(call)) {
    throw Error(`Param "call" expected to be call() object`)
  }
  const { fn, args } = call.CALL
  const currentIterator = isGenerator(fn)
    ? (iterator || fn(...args))
    : undefined
  try {
    let result
    if (currentIterator) {
      result = currentIterator.next()
    } else {
      result = fn(...args)
    }
    const data = isPromise(result) ? await result : result
    return {
      callIndex,
      data: currentIterator ? data.value : data,
      iterator: currentIterator,
      done: currentIterator ? data.done : undefined
    }
  } catch (err) {
    return {
      callIndex,
      error: err,
      iterator: currentIterator
    }
  }
}

async function * all (calls = []) {
  if (!calls || calls.length === 0) {
    return
  }
  // Calls left
  let callIndex = 0
  const callsLeft = {}
  for (const call of calls) {
    if (isCall(call)) {
      callsLeft[callIndex] = {
        call,
        promise: callToPromise(call, callIndex)
      }
      callIndex++
    }
  }
  // Promise concurrency
  let icc = 0
  while (++icc < 10) {
    const promises = Object.entries(callsLeft).map(el => el[1].promise)
    if (promises.length === 0) {
      break
    }
    const { callIndex, data, error, iterator, done } = await Promise.race(promises)
    if (iterator) {
      if (done) {
        delete callsLeft[callIndex]
      } else {
        yield error || data
        // Repeat iterable
        const call = callsLeft[callIndex].call
        callsLeft[callIndex] = {
          call,
          promise: callToPromise(call, callIndex, iterator),
          iterator
        }
      }
    } else {
      delete callsLeft[callIndex]
      yield error || data
    }
  }
}

module.exports = {
  call,
  all
}
