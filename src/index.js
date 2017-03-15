export default store => {
  const memo = Object.create(null)

  store.cacheDispatch = (...args) => {
    const type = args[0]
    if (type in memo) {
      return memo[type]
    }
    memo[type] = store.dispatch(...args)
    return memo[type]
  }
}
