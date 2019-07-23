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
    const repeat = options.repeat > 0 ? parseInt(options.repeat, 10) : 1
    callsLeft[callIndex] = {
      funcCreator: funcCreator,
      options: {
        repeat,
        currentRepeat: 1
      },
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
    // Repeat feature
    if (error) {
      const options = callsLeft[callIndex].options
      if (options.repeat > options.currentRepeat) {
        options.currentRepeat++
        callsLeft[callIndex].promise =
          wrapPromise(callsLeft[callIndex].funcCreator, callIndex)
        continue
      }
    }
    delete callsLeft[callIndex]
    yield error || data
  }
}

class Executable {
  constructor (funcCreator, { repeat } = {}) {
    this.funcCreator = funcCreator
    this.options = {
      repeat: repeat > 0 ? repeat : 1
    }
    return this
  }
  repeat (count) {
    if (count > 0) {
      this.options.repeat = count
    }
    return this
  }
}

function call (funcCreator, options = {}) {
  return new Executable(funcCreator, options)
}

module.exports = {
  parallel,
  call
}
