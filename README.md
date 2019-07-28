# parallel-generator

[![Build Status](https://travis-ci.org/s-lyn/parallel-generator.svg?branch=master)](https://travis-ci.org/s-lyn/parallel-generator)


## Install

```sh
$ npm i parallel-generator
```

## Usage

```js
const { parallel, call } = require('parallel-generator')

const tasks = [
  call(() => Promise.resolve('One')),
  call(() => Promise.resolve('Two')),
  call(() => Promise.reject(new Error('Three')))
]

async function main () {
  for await (const response of parallel(tasks)) {
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
Two
Catched error: Three
```


### call `(funcCreator, options = {})`

| Param | Type | Description |
|-------|------|-------------|
| funcCreator | {Function}\* | Task constructor - should return new task every call |
| options | {Object} | Options |
| options.repeat | {Number} | Number of task repeats on error. Default: 1 |


### parallel `(tasks = [])`

| Param | Type | Description |
|-------|------|-------------|
| tasks | {Array} | List of calls. Use function `call()` to create it |

