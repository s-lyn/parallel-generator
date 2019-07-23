const isPromise = require('is-promise')

async function wrapPromise (funcCreator, callIndex) {
  try {
    const func = funcCreator()
    const promise = isPromise(func)
      ? func
      : Promise.resolve(func)
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

async function * parallel (calls = []) {
  if (!calls || calls.length === 0) {
    return
  }
  // Calls left
  let callIndex = 0
  const callsLeft = {}
  for (const { funcCreator, options } of calls) {
    callsLeft[callIndex] = {
      funcCreator: funcCreator,
      options: options,
      promise: wrapPromise(funcCreator, callIndex)
    }
    callIndex++
  }
  // Promise concurrency
  while (true) {
    const wrappedPromises = Object.entries(callsLeft).map(el => el[1].promise)
    if (wrappedPromises.length === 0) {
      break
    }
    try {
      const raw = await Promise.race(wrappedPromises)
      const { callIndex, data, error } = raw
      delete callsLeft[callIndex]
      yield error || data
    } catch (err) {
      yield err
    }
  }
}

function call (funcCreator, options = {}) {
  return {
    funcCreator,
    options
  }
}

module.exports = {
  parallel,
  call
}
