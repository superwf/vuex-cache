# CHANGELOG

## 3.0.0

- **Breaking Change**: Module exports a factory to create plugin instead of the plugin itself.

  ```js
  import Vue from 'vue'
  import Vuex, { Store } from 'vuex'
  import createCache from 'vuex-cache'

  Vue.use(Vuex)

  const store = new Store({
    plugins: [createCache()],
    ...
  })
  ```

- **Breaking Change**: `store.cache.has()` returns `false` for expired actions.

  ```js
  const store = new Store({
    plugins: [createCache()],
    actions: {
      'ACTION': () => {}
    }
  })

  store.cache.has('ACTION')
  //=> false

  store.cache.dispatch('ACTION', undefined, {
    timeout: 100
  });

  store.cache.has('ACTION')
  //=> true

  setTimeout(() => {
    store.cache.has('ACTION')
    //=> false
  }, 100)
  ```

  This fixes issue [#28](https://github.com/superwf/vuex-cache/issues/28).

- **Breaking Change**: Cache is module scoped and don't support multiple instances anymore.

  This fixes an issue with `cacheAction` cache state different from plugin one.

- **Breaking Change**: `createCache` returns

  This fixes an issue with `cacheAction` cache state different from plugin one.

- **Breaking Change**: Rename main source module and bundles.

  - Main module `index.js` is now `vuex-cache.js`
  - CommonJS bundle `dist/vuex-cache.cjs.js` is now `dist/vuex-cache.js`
  - ESM bundle `dist/vuex-cache.es.js` is now `dist/vuex-cache.mjs`
  - UMD bundle `dist/vuex-cache.js` is now `dist/vuex-cache.umd.js`
  - UMD minified bundle `dist/vuex-cache.min.js` is now `dist/vuex-cache.umd.min.js`

- It now supports some of non JSON parseable values as arguments. Like functions, `undefined` and other values.

  This fixes issue [#30](https://github.com/superwf/vuex-cache/issues/30).

- It fallback dispatches to uncached if params have circular references.

  This fixes issue [#29](https://github.com/superwf/vuex-cache/issues/29).

- Add JSDoc comments to functions and values.

- Rename main module, functions and variables.

- Refactor unit tests and split them into multiple modules.

- Upgrade dependencies and bundle settings.

- Create type definitions for TS developers & Editor/IDE intellisense.

  This fixes issue [#32](https://github.com/superwf/vuex-cache/issues/32).

- Add MIT License.

- Improve `README.md` docs.

  This fixes issue [#21](https://github.com/superwf/vuex-cache/issues/21).

  - Add **Installation on Nuxt.js** section to `README.md`.

    This fixes issue [#26](https://github.com/superwf/vuex-cache/issues/26).

  - Move `Map` polyfill notice to **Compatibility** section.

    Maybe fix the cause of issue [#31](https://github.com/superwf/vuex-cache/issues/31).

  - Improve **Installation** section on `README.md`.

  - Refactor **Usage** section and move it up.

  - Create **API** section with docs about `cache` methods, **Payload** and **Timeout**.

  - Remove old docs about `cache` methods, payload and timeout.

  - Change `package.json` description and keywords.

## 2.1.0

- Improve documentation.
  - Fix title on `README.md`;
  - Add `CHANGELOG` file.
  - Improve **Compatibility**, **Installation** sections and move them up on `README.md`.

  This is part of a pretty big docs improvement suggested by [@vjee](https://github.com/vjee) on issue [#21](https://github.com/superwf/vuex-cache/pull/21).

- Add [@VitorLuizC](https://github.com/VitorLuizC) to contributors on package.

- Upgrade dependencies.

- Remove unused `babel`, `eslint` and `jest` plugins.

- Improve bundle, test and lint
  - Remove comments and unused env on `.eslintrc.js`.
  - Remove unused env and plugins on `babel.config.js`.
  - Delete `.eslintignore` file.
  - Enforce Yarn and on package scripts.
  - Remove `npx` and `NODE_ENV` assignment on package scripts.

## 2.0.0

- **Breaking Change**: Actions that throw error, or that returns a promise rejection, will no longer be added to the cache.

  ```js
    'UPDATE_USER': async () => {
      // ...
      throw new Error('An unknown error.');
    }
  };

  await store.cache.dispatch('UPDATE_USER');
  // throws Error: An unknown error.

  store.cache.has('UPDATE_USER');
  //=> false
  ```

  This fixes issues [#7](https://github.com/superwf/vuex-cache/issues/7), [#16](https://github.com/superwf/vuex-cache/issues/17) and [#18](https://github.com/superwf/vuex-cache/issues/17).

- Exports `cacheAction` function, an _action enhancer_, to make `cache` available on action context.

  ```js
  import { cacheAction } from 'vuex-cache';

  // ...
    'UPDATE_CATEGORIES': cacheAction(({ commit, cache }, category) => {
      const categories = cache.dispatch('GET_CATEGORIES');
      commit('CATEGORIES', [ ...categories, category ]);
    })
  };
  ```

  Thanks to [@qnp](https://github.com/qnp) for PR [#17](https://github.com/superwf/vuex-cache/pull/17).

## 1.4.1

- Use bili instead of own bundle script. It bundles ESM module down to ES5 and generates UMD and UMD + min modules.

  This is added on PR [#13](https://github.com/superwf/vuex-cache/pull/13) and fixes issues [#8](https://github.com/superwf/vuex-cache/issues/8) and [#12](https://github.com/superwf/vuex-cache/issues/12).

- Fix a typo on `README.md`.

  Thanks to [@manAbl](https://github.com/manAbl) for PR [#15](https://github.com/superwf/vuex-cache/pull/15).

## 1.4.0

- Adds an option to define default timeout on actions. `timeout` option is optional and it's overwritten by action specific `timeout`.

  ```js
  import Vuex, { Store } from 'vuex'
  import cache from 'vuex-cache'

  const store = new Vuex.Store({
    plugins: [ cache({ timeout: 2000 }) ],
    ...
  })
  ```

  Improvement suggested by [@hvaughan3](https://github.com/hvaughan3) on [#11](https://github.com/superwf/vuex-cache/issues/11).

## 1.3.0

- Add `timeout` option to dispatch options.

  ```js
  store.cache.dispatch({
    type: 'UPDATE_USER',
    param: payload,
    timeout: 100
  })

  // Or using dispatch's third argument (`DispatchOptions`).
  store.cache.dispatch('UPDATE_USER', payload, {
    timeout: 100
  })
  ```

  Improvement suggested by [@razekteixeira](https://github.com/razekteixeira) on [#11](https://github.com/superwf/vuex-cache/issues/6) and by [@samsebastian](https://github.com/samsebastian) on [#4](https://github.com/superwf/vuex-cache/issues/4).

## 1.2.0

- Change build and tests:
  - Update `babel` to version 7 and use `babel-env`;
  - Use `jest` instead of `mocha` and `expect` for unit tests;
  - Use rollup to generate ESM + ES6 bundle, besides the CommonJS + ES5 one.

## 1.1.1

- Fixe `cache.delete` function for actions with a payload.

## 1.1.0

- Add support to cache actions with params/payloads.

  ```js
  store.cache.dispatch({
    type: 'UPDATE_USER',
    param: payload
  })

  store.cache.dispatch('UPDATE_USER', payload)
  ```

  Improvement suggested by [@eele94](https://github.com/eele94) on [#5](https://github.com/superwf/vuex-cache/issues/5).

## 1.0.1

- Remove Vue and Vuex peer dependencies.

  This is added on PR [#3](https://github.com/superwf/vuex-cache/pull/3) and fixes issue [#2](https://github.com/superwf/vuex-cache/issues/2).

## 1.0.0

- Use a `Map` instance instead of own functions to check, delete and clean cache.

  This is added on PR [#1](https://github.com/superwf/vuex-cache/pull/1).
