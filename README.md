# vuex cache action

When vuex action fetch some data by request remote api, vuex-cache can store the action result, when next time the same action runs, it will not make a new request and just return the cached result.

### Compatibility
Compatible with vue2.x and vuex2.x

### install
```bash
npm install vuex-cache
```

### usage

```javascript
import Vuex from 'vuex'
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

### api

```javascript
store.cacheDispatch(ACTION_NAME)
```
params is same with vuex store.dispatch

cacheDispatch will cache the result, so do **not** use it to make some actions with different params, when params change, cacheDispatch would still return the first cached result, and the data in store will not change.

```javascript
store.removeCache(ACTION_NAME)
```
remove cached action, will **not** remove the data in store. when call cacheDispatch with same type, the request in that action will run again.

```javascript
store.hasCache(ACTION_NAME)
```
return bool if ACTION\_NAME has been cached

```javascript
store.clearCache()
```
clear all cached keys
