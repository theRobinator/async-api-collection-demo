# Async API call collection demo

This tiny repo is a demo of an API call aggregator in node.js. All of the logic lives in `main.ts`, and the real meat
of the implementation is in the `resolvePromiseValues` function.

`resolvePromiseValues` is meant to be implemented in the framework and usually unseen by developers. The common use
case is demonstrated in the server's request handler.


## Running the server

```bash
npm install
npm run start
```
