# parallel-generator

[![Build Status](https://travis-ci.org/s-lyn/parallel-generator.svg?branch=master)](https://travis-ci.org/s-lyn/parallel-generator)


## Install

```sh
$ npm i parallel-generator
```

## Usage

```js
const { all, call } = require('parallel-generator')

const fn2 = async (message, count) => message.repeat(count)
const tasks = [
  call(() => Promise.resolve('One')),
  call(fn2, 'Two', 2),
  call(() => Promise.reject(new Error('Three')))
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

