export default store => {
  const cache = Object.create(null)
  store.cacheDispatch = function cacheDispatch () {
    const type = arguments[0]
    if (type in cache) {
      return cache[type]
    }
    cache[type] = store.dispatch.apply(store, arguments)
    return cache[type]
  }

  store.removeCache = actionName => {
    if (actionName in cache) {
      delete cache[actionName]
      return true
    }
    return false
  }

  store.hasCache = key => {
    return key in cache
  }

  store.clearCache = () => {
    for (const key in cache) {
      delete cache[key]
    }
    return true
  }
}
