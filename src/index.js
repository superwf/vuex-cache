export default store => {
  const dispatch = store.dispatch

  const memo = Object.create(null)

  store.dispatch = (...args) => {
    const type = args[0]
    if (type in memo) {
      return memo[type]
    }
    memo[type] = dispatch.apply(store, args)
    return memo[type]
  }
}
