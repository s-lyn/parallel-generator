const isPromise = require('is-promise')

async function * parallel (calls = []) {
  if (!calls || calls.length === 0) {
    return
  }
  // Call sync
  const promises = calls.map(el => {
    const func = el.funcCreator()
    // Update current promise
    const promise = isPromise(func) ? func : Promise.resolve(func)
    el.promise = promise
    return promise
  })
  // Promise all
  const responses = await Promise.all(promises)
  for (const response of responses) {
    yield response
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
