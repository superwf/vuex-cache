export default store => {
  const cache = Object.create(null)
  store.cacheDispatch = (...args) => {
    const type = args[0]
    if (type in cache) {
      return cache[type]
    }
    cache[type] = store.dispatch(...args)
    return cache[type]
  }

  store.clearCache = (...args) => {
    const type = args[0]
    if (type in cache) {
      delete cache[type]
      return true
    }
    return false
  }
}
