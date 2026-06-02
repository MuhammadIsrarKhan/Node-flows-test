# Title Flow Test

Four minimal HTTP servers that solve the same problem using different async patterns: **callbacks**, **async.js**, **Promises**, and **RxJS**.

Each server accepts one or more website addresses, fetches their HTML `<title>` tags in parallel, and returns a simple HTML page listing the results.

## Project structure

```
title-flow-test/
├── src/
│   ├── lib/
│   │   └── utils.js          # Shared fetch, parse, and HTTP helpers
│   ├── callback/callbacks.js # Raw callbacks + manual coordination
│   ├── async/async.js        # async.js map()
│   ├── promise/promises.js   # Promise.all()
│   └── rxjs/rxjs.js          # RxJS from() + forkJoin()
└── package.json
```

Shared business logic lives in `src/lib/utils.js`. Each server differs only in how it coordinates parallel fetches.

## Getting started

```bash
npm install
```

Run any implementation (each uses a different port):

| Command           | Port | Async pattern        |
|-------------------|------|----------------------|
| `npm run callback`| 3000 | Callbacks            |
| `npm run async`   | 3001 | async.js             |
| `npm run promise` | 3002 | Promises             |
| `npm run rxjs`    | 3003 | RxJS                 |

## Example request

With the callback server running on port 3000:

```
http://localhost:3000/I/want/title?address=google.com&address=github.com
```

Response: an HTML page listing each address and its fetched title (or `NO RESPONSE` on failure).

## Tests

```bash
npm test
```

Tests cover pure helper functions in `src/lib/utils.js` (`normalizeAddress`, `extractTitle`).

## Why four implementations?

This repo is a comparison lab for discussing async concurrency in Node.js:

- **Callbacks** — lowest level; manual completion counting
- **async.js** — library abstraction over callback patterns
- **Promises** — native `Promise.all` for parallel work
- **RxJS** — observable streams with `forkJoin`

Same route, same output shape, different coordination models.
