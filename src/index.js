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
 * Dispatch's options object.
 * @typedef {import('vuex').DispatchOptions & { timeout: number }} DispatchOptions
 */

/**
 * Dispatch's payload object.
 * @typedef {import('vuex').Payload & { timeout: number }} Payload
 */

/**
 * Type alias for Dispatch parameters.
 * @typedef {[string, any?, DispatchOptions?]|[Payload, DispatchOptions?]} DispatchParams
 */

/**
 * Resolve Dispatch parameters.
 * @param {DispatchParams} params
 * @returns {[string, Payload?, DispatchOptions?]}
 */
const resolveParams = params =>
  isObject(params[0]) ? [params[0].type, params[0], params[1]] : params

/**
 * Generate key from Dispatch parameters.
 * @param {DispatchParams} params
 * @returns {string}
 */
const generateKey = params => {
  const [type, payload] = resolveParams(params)
  return `${type}:${toString(payload)}`
}

/**
 * Check if value has timeout property.
 * @param {any} value
 * @returns {value is { timeout: number }}
 */
const hasTimeout = value => isObject(value) && typeof value.timeout === 'number'

/**
 * Resolve timeout from parameters and plugin options.
 * @param {DispatchParams} params
 * @param {{ timeout?: number }} pluginOptions
 * @returns {number}
 */
const resolveTimeout = (params, pluginOptions) => {
  const dispatchOptions = typeof params[0] === 'string' ? params[2] : params[0]
  if (hasTimeout(dispatchOptions)) {
    return dispatchOptions.timeout
  } else if (hasTimeout(pluginOptions)) {
    return pluginOptions.timeout
  }
  return 0
}

const cachePlugin = (store, option) => {
  const cache = new Map()
  // use another map to store timeout for each type
  const timeoutCache = new Map()

  cache.dispatch = (...params) => {
    const key = generateKey(params)

    const timeout = resolveTimeout(params, option)
    if (timeout) {
      const now = Date.now()
      if (!timeoutCache.has(key)) {
        timeoutCache.set(key, now)
      } else {
        const timeoutOfCurrentType = timeoutCache.get(key)
        // console.log(now - timeout, timeoutOfCurrentType)
        if (now - timeout > timeoutOfCurrentType) {
          cache.delete(...params)
          timeoutCache.delete(key)
        }
      }
    }

    if (!cache.has(...params)) {
      const action = store.dispatch.apply(store, params)

      action.catch(error => {
        cache.delete(...params)
        return Promise.reject(error)
      })

      cache.set(key, action)
    }

    return cache.get(key)
  }

  const _has = cache.has.bind(cache)
  cache.has = (...params) => {
    return _has(generateKey(params))
  }

  const _delete = cache.delete.bind(cache)
  cache.delete = (...params) => {
    return _delete(generateKey(params))
  }

  store.cache = cache
}

const createCache = storeOrOptions => {
  if (isStore(storeOrOptions)) {
    return cachePlugin(storeOrOptions)
  }
  return store => cachePlugin(store, storeOrOptions)
}

// expose plugin as default
export default createCache

// expose action enhancer
export function cacheAction(action) {
  return function cacheEnhancedAction(context, payload) {
    cachePlugin(context)
    return action(context, payload)
  }
}
