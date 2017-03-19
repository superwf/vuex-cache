# vuex cache action

* * *

When vuex action fetch some data by request remote api, vuex-cache can store the action result, when next time the same action runs, it will not make a new request and just return the cached result.

## install
```
npm install vuex-cache
```

## usage

```
import vuexCache from 'vuex-cache'
const store = new Vuex.Store({
  state: {
    ...
  },

  plugins: [vuexCache],

  mutations: {
    ...
  },

  actions: {
    ...
  }
})

store.cacheDispatch('LIST')
```

## api

```
store.cacheDispatch(ACTION_NAME)
```
params is same with vuex store.dispatch

cacheDispatch will cache the result, so do **not** use it to make some actions with different params, when params change, cacheDispatch would still return the first cached result, and the data in store will not change.

```
store.removeCache(ACTION_NAME)
```
clear cached action, will **not** clear the data in store. when call cacheDispatch with same type, the request in that action will run again.

```
store.hasCache(ACTION_NAME)
```
return bool if ACTION\_NAME has been cached

```
store.clearCache
```
clear all cached keys
