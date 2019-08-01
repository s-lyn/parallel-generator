# parallel-generator

[![Build Status](https://travis-ci.org/s-lyn/parallel-generator.svg?branch=master)](https://travis-ci.org/s-lyn/parallel-generator)

Small library like ```js Promise.all()```, but for diferrent objects: generators,
async generators, synchronous and asynchronous functions. 

## Install

```sh
$ npm i parallel-generator
```

## Usage

```js
const { all, call } = require('parallel-generator')

const syncFn = (message, count) => message.repeat(count)
const syncGenerator = function * (...args) {
  for (const arg of args) {
    yield arg
  }
}
const asyncFn = (message) => {
  return new Promise(resolve => setTimeout(() => resolve(message), 10))
}
const asyncError = (message) => {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error(message)), 10))
}
const tasks = [
  call(syncFn, 'One', 1),
  call(syncGenerator, 'Two', 'Three'),
  call(asyncFn, 'Five'),
  call(syncFn, 'Four', 2),
  call(asyncError, 'Six')
]

async function main () {
  for await (const response of all(tasks)) {
    if (response instanceof Error) {
      console.error(`Catched error: ${response.message}`)
    } else {
      console.log(response)
    }
  }
}

main().catch(console.error)
```

Console output:

```text
One
TwoTwo
Catched error: Three
```


### call `(fn, ...args)`

| Param | Type | Description |
|-------|------|-------------|
| fn | {Function}\* | Function |
| args | {Array} | List of arguments |


### all `(calls = [])`

| Param | Type | Description |
|-------|------|-------------|
| calls | {Array} | List of calls. Use function `call()` to create it |

