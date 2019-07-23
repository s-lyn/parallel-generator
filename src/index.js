const isPromise = require('is-promise')

function wrapPromise (funcCreator, callIndex) {
  const promise = isPromise(funcCreator)
    ? funcCreator()
    : Promise.resolve(funcCreator())
  return promise
    .then(data => ({
      callIndex,
      data
    }))
    .catch(error => ({
      callIndex,
      error
    }))
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
    const { callIndex, data, error } = await Promise.race(wrappedPromises)
    delete callsLeft[callIndex]
    yield data
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
