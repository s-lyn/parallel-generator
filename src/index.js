const isPromise = require('is-promise')

function wrapPromise (funcCreator, callIndex) {
  let func
  try {
    func = funcCreator()
  } catch (err) {
    return Promise.resolve({
      callIndex,
      error: err
    })
  }
  const promise = isPromise(func)
    ? func
    : Promise.resolve(func)
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
    try {
      const raw = await Promise.race(wrappedPromises)
      const { callIndex, data, error } = raw
      // console.log('~~ callIndex:', callIndex)
      // console.log('~~ data:', data)
      // console.log('~~ error:', error)
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
