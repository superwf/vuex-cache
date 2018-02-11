# vuex cache action

When vuex action fetch some data by request remote api, vuex-cache can store the action result, when next time the same action runs, it will not make a new request and just return the cached result.

### Compatibility
- Any Vue version, since `vuex-cache` just deals with Vuex
- Vuex versions 1, 2 and 3

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

store.cache.dispatch('LIST')
```

### api

#### NOTICE: after update to 1.0.0, main api is different from the previous version 0.3.1

From version 1.0.0 your env should has **Map** object, or import **Map** from babel-polyfill
Thanks [VitorLuizC](https://github.com/VitorLuizC)

~~cacheDispatch will cache the result, so do **not** use it to make some actions with different params, when params change, cacheDispatch would still return the first cached result, and the data in store will not change.~~
From version 1.1.0 it could cache ACTION\_NAME with or without params.
Thanks the idea by [eele94](https://github.com/eele94)

NOTICE: When with object param, the param will be converted to JSON for the cache key, so be careful the object key order.
Object with different key order will transfer to different JSON string, and will generate independent cache.

```javascript
JSON.stringify({a: 1, b: 2}) // '{"a":1,"b":2}'
JSON.stringify({b: 2, a: 1}) // '{"b":1,"a":2}'
```

With or without param, cacheDispatch will create independent cache.
When with object param like
```javascript
{
  type: ACTION_NAME,
  param: {...}
}
```
vuex-cache use JSON.stringify to generate the cache key, so the object do not must be the same object, just with same structure it will be dill with to the same cache.


```javascript
store.cache.dispatch(ACTION_NAME)
// or
store.cache.dispatch(ACTION_NAME, param)
// or
store.cache.dispatch({
  type: ACTION_NAME,
  param: {...}
})
```
params is same with vuex store.dispatch

```javascript
store.cache.delete(ACTION_NAME)
// or
store.cache.delete(ACTION_NAME, param)
// or
store.cache.delete({
  type: ACTION_NAME,
  param: {...}
})
```
remove cached action, will **NOT** remove the data in store. when call cacheDispatch with same type, the request in that action will run again.

```javascript
store.cache.has(ACTION_NAME)
// or
store.cache.has(ACTION_NAME, param)
// or
store.cache.has({
  type: ACTION_NAME,
  param: {...}
})
```
return bool if ACTION\_NAME has been cached

```javascript
store.cache.clear()
```
clear all cached keys
