# vuex-cache

Cache dispatched actions and prevent repeated requests and heavy actions.

## Compatibility

- `Map` and `Promise` are required (you can use polyfills, like [`@babel/polyfill`](https://babeljs.io/docs/en/babel-polyfill));
- Any Vue version, since `vuex-cache` just deals with Vuex;
- Vuex versions 1, 2 and 3.

## Installation

`vuex-cache` is published in the NPM registry and can be installed using any compatible package manager.

```sh
npm install vuex-cache --save

# For Yarn use the command below.
yarn add vuex-cache
```

Import `createCache` factory and use on `Vuex`'s plugins.

```js
import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import createCache from 'vuex-cache';

const store = new Store({
  plugins: [createCache()],
  ...
});
```

### Installation on [Nuxt.js](https://github.com/nuxt/nuxt.js)

> Only use it if you're not using [Classic Mode](https://nuxtjs.org/guide/vuex-store#classic-mode).

Create a module on plugins to setup `vuex-cache`. Call `vuex-cache` with your options, then call returned value with store on `onNuxtReady` event.

**`~/plugins/vuex-cache.js`**

```js
import createVuexCache from 'vuex-cache';

export default ({ store }) => {
  const options = {
    timeout: 2 * 60 * 60 * 1000 // Equal to 2 hours in milliseconds.
  };

  const setupVuexCache = createVuexCache(options);

  window.onNuxtReady(() => setupVuexCache(store));
};
```

Then just add this plugin to your nuxt configuration. Like the example below.

**`~/nuxt.config.js`**

```js
module.exports = {
  ...,
  plugins: [
    ...,
    { src: '~/plugins/vuex-cache.js', ssr: false },
  ]
};
```

## Usage

After install you can use `cache` property to call cache methods.

```js
const store = new Store({
  ...,
  actions: {
    'FETCH_USER': async (_, id) => {
      const response = await fetch(baseURL + '/user/' + id);
      const { users } = await response.json();
      return users;
    }
  }
});

store.cache.dispatch('FETCH_USER', 1);
//=> Promise { User }
```

## API

### `createCache`

The default exported factory to create `Vuex`'s store plugin. It define `cache` property on Store instances.

```js
import { Store } from 'vuex';
import createCache from 'vuex-cache';

const store = new Store({
  plugins: [
    createCache()
  ]
})
```

### `cacheAction`

A named exported function to enhance actions and define `cache` property on ActionContext instances.

```js
import { cacheAction } from 'vuex-cache';

// ...

const actions = {
  'FETCH_STARGAZERS': cacheAction(
    ({ cache, commit }, payload) => (
      cache.dispatch('FETCH_REPOSITORIES')
        .then((repos) => Promise.all(repos.map(getStargazers)))
        .then((stargazers) => {
          commit('STARGAZERS', [].concat(...stargazers));
        })
    )
  ),

  'SET_STARGAZERS': (context, payload) => { ... }
}
```

### `store.cache.dispatch`

Dispatches an action if it's not cached and set it on cache, otherwise it returns cached `Promise`.

> It uses action **name** and **payload** as cache key.

```js
store.cache.dispatch('user/GET_USER');
//=> Promise { User }

// Returns value without dispatching the action again.
store.cache.dispatch('user/GET_USER');
//=> Promise { User }
```

### `store.cache.has`

Check if an action is cached. Returns `true` if action is cached and `false` otherwise.

```js
store.cache.has('user/GET_USER');
//=> true

store.cache.has('FETCH_REPOSITORY', 219);
//=> false
```

### `store.cache.delete`

Delete an action from cache. Returns `true` if action is deleted and `false` otherwise.

```js
store.cache.delete('user/GET_USER');
//=> true

store.cache.delete('FETCH_REPOSITORY', 219);
//=> false
```

> Only exact matches are deleted. Use `store.cache.clear` to delete all items or by action name.

### `store.cache.clear`

Clear the cache, delete all actions from it. Returns `true` if cache is cleared and `false` otherwise.

```js
store.cache.clear();
//=> true
```

If using the type parameter, only actions with the specified type are deleted from cache and the number of deleted keys is returned.

```js
// store.cache.dispatch('FETCH_REPOSITORIES', { page: 1 });
// store.cache.dispatch('FETCH_REPOSITORIES', { page: 2 });
store.cache.clear('FETCH_REPOSITORIES');
//=> 2
```

### `mapCacheActions`

Create component methods that dispatch a cached action.

```js
import { mapCacheActions } from 'vuex-cache';

export default {
  name: 'Users',
  methods: {
    ...mapCacheActions(['FETCH_REPOSITORY']),
    ...mapCacheActions('user', ['GET_USER']),
  },
  async mounted() {
    this.GET_USER();
    this.FETCH_REPOSITORY(219, {
      timeout: 30000
    });
  }
}
```

### Payload

The payload value is `undefined` as default and supports functions, primitive values and JSON parseable objects.

`store.cache.dispatch`, `store.cache.has` and `store.cache.delete` supports payload object as argument.

```js
store.cache.dispatch({
  type: 'FETCH_REPOSITORY',
  payload: 198
});
//=> Promise { Repository }

store.cache.has({
  type: 'FETCH_REPOSITORY',
  payload: 198
});
//=> true

store.cache.delete({
  type: 'FETCH_REPOSITORY',
  payload: 198
});
//=> true
```

### Timeout

`timeout` option is `0` as default and define cache duration is milliseconds.

> **`0`** means it has no defined duration, no timeout.

```js
const store = new Store({
  plugins: [
    createCache({ timeout: 10000 })
  ],
  ...
});
```

After milliseconds defined in timeout option an action is expired from cache.

```js
// This dispatches the action and set it on cache.
store.cache.dispatch('FETCH_REPOSITORY', 219);
//=> Promise { Repository }

store.cache.has('FETCH_REPOSITORY', 219);
//=> true

setTimeout(() => {

  // It returns false because the action is expired.
  store.cache.has('FETCH_REPOSITORY', 219);
  //=> false

  // This dispatches the action again because the action is expired.
  store.cache.dispatch('FETCH_REPOSITORY', 219);
  //=> Promise { Repository }
}, 10000)
```

Store's timeout can be overwritten by dispatch timeout option in Dispatch Options or in payload.

```js
store.cache.dispatch('FETCH_REPOSITORY', 219, {
  timeout: 30000
});

// OR

store.cache.dispatch({
  type: 'FETCH_REPOSITORY',
  payload: 219,
  timeout: 30000
});
```
