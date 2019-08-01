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

async function callToPromise (call, callIndex) {
  if (!isCall(call)) {
    throw Error(`Param "call" expected to be call() object`)
  }
  const { fn, args } = call.CALL
  try {
    const result = fn(...args)
    const promise = isPromise(result)
      ? result
      : Promise.resolve(result)
    const data = await promise
    return {
      callIndex,
      data
    }
  } catch (err) {
    return {
      callIndex,
      error: err
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
  while (true) {
    const promises = Object.entries(callsLeft).map(el => el[1].promise)
    if (promises.length === 0) {
      break
    }
    const { callIndex, data, error } = await Promise.race(promises)
    delete callsLeft[callIndex]
    yield error || data
  }
}

module.exports = {
  call,
  all
}
