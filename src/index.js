/**
 * Check if value is an object.
 * @param {any} value
 * @returns {value is Object}
 */
const isObject = value => !!value && typeof value === 'object'

/**
 * Check if value is a Store.
 * @param {any} value
 * @returns {value is import('vuex').Store<any>}
 */
const isStore = value => isObject(value) && typeof value.dispatch === 'function'

/**
 * Convert value to `string`.
 * @param {any} value
 * @returns {string}
 */
const toString = value =>
  isObject(value) ? JSON.stringify(value) : String(value)

/**
 * Type alias for Dispatch parameters.
 * @typedef {[string, any?, import('vuex').DispatchOptions?]|[import('vuex').Payload, import('vuex').DispatchOptions?]} DispatchParams
 */

/**
 * Generate key from Dispatch parameters.
 * @param {DispatchParams} params
 * @returns {string}
 */
const generateKey = params => {
  const isPayload = typeof params[0] !== 'string'
  const type = isPayload ? params[0].type : params[0]
  const payload = isPayload ? params[0] : params[1]
  return `${type}:${toString(payload)}`
}

// parse timeout prop in option
const getTimeout = (args, option) => {
  if (args.length === 1 && args[0].timeout) {
    return args[0].timeout
  }
  if (args.length === 3 && args[2].timeout) {
    return args[2].timeout
  }
  if (option && option.timeout) {
    return option.timeout
  }
  return 0
}

const cachePlugin = (store, option) => {
  const cache = new Map()
  // use another map to store timeout for each type
  const timeoutCache = new Map()

  cache.dispatch = (...params) => {
    const type = generateKey(params)

    const timeout = getTimeout(params, option)
    if (timeout) {
      const now = Date.now()
      if (!timeoutCache.has(type)) {
        timeoutCache.set(type, now)
      } else {
        const timeoutOfCurrentType = timeoutCache.get(type)
        // console.log(now - timeout, timeoutOfCurrentType)
        if (now - timeout > timeoutOfCurrentType) {
          cache.delete(type)
          timeoutCache.delete(type)
        }
      }
    }

    if (!cache.has(type)) {
      const action = store.dispatch.apply(store, params).catch(error => {
        cache.delete(type)
        return Promise.reject(error)
      })

      cache.set(type, action)
    }
    return cache.get(type)
  }

  const _has = cache.has.bind(cache)
  cache.has = (...params) => {
    const key = generateKey(params)
    return _has(toString(key))
  }

  const _delete = cache.delete.bind(cache)
  cache.delete = (...params) => {
    const key = generateKey(params)
    return _delete(toString(key))
  }

  store.cache = cache
}

const resolveParams = args => {
  if (!isStore(args)) {
    return store => cachePlugin(store, args)
  }
  return cachePlugin(args)
}

// expose plugin as default
export default resolveParams

// expose action enhancer
export function cacheAction(action) {
  return function cacheEnhancedAction(context, payload) {
    cachePlugin(context)
    return action(context, payload)
  }
}
