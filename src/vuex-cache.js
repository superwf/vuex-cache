/**
 * Check if value is an object.
 * @param {any} value
 * @returns {value is Object}
 */
const isObject = value => !!value && typeof value === 'object'

/**
 * Type alias for Store or ActionContext instances.
 * @typedef {import('vuex').Store<any> | import('vuex').ActionContext<any, any>} Store
 */

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
 * Type alias for options object.
 * @typedef {{ timeout?: number }} Options
 */

/**
 * Resolve timeout from parameters and plugin options.
 * @param {DispatchParams} params
 * @param {Options} [pluginOptions]
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

/**
 * Check if value (time) is expired.
 * @param {number} [expiresIn]
 * @returns {boolean}
 */
const isExpired = expiresIn => !!expiresIn && Date.now() > expiresIn

/**
 * Cache's state record.
 * @typedef {{ expiresIn?: number, value: Promise<any> }} CacheRecord
 */

/**
 * Cache's state.
 * @type {Map<string, CacheRecord>}
 */
const state = new Map()

/**
 * Define cache property to store, or action context, object.
 * @param {Store} store
 * @param {Options} [options]
 */
const defineCache = (store, options) => {
  const cache = {
    /**
     * Dispatch an action and set it on cache.
     * @param  {...DispatchParams} params
     * @returns {Promise<any>}
     */
    dispatch(...params) {
      const key = generateKey(params)
      const { value, expiresIn } = state.get(key) || {}

      if (!!value && !isExpired(expiresIn)) {
        return value
      }

      const timeout = resolveTimeout(params, options)

      const record = {
        expiresIn: timeout ? Date.now() + timeout : undefined,
        value: store.dispatch.apply(store, params),
      }

      state.set(key, record)

      return record.value.catch(error => {
        state.delete(key)
        return Promise.reject(error)
      })
    },

    /**
     * Check if an action dispatch is on cache.
     * @param  {...DispatchParams} params
     * @returns {boolean}
     */
    has(...params) {
      const record = state.get(generateKey(params))
      return isObject(record) && !isExpired(record.expiresIn)
    },

    /**
     * Clear cache. Returns `true` if cache was cleared and `false` otherwise.
     * @returns {boolean}
     */
    clear() {
      return state.clear()
    },

    /**
     * Detele an action dispatch from cache. Returns `true` if it was deleted
     * and `false` otherwise.
     * @returns {boolean}
     */
    delete(...params) {
      const key = generateKey(params)
      return state.delete(key)
    },
  }

  Object.defineProperty(store, 'cache', {
    value: cache,
    writable: false,
    enumerable: true,
    configurable: false,
  })
}

/**
 * Type alias for Action.
 * @typedef {import('vuex').Action<any, any>} Action
 */

/**
 * Create cache with options and define it on action context instance.
 * @param {Action} action
 * @param {Options} [options]
 * @returns {Action}
 */
export const cacheAction = (action, options) =>
  function(context, payload) {
    defineCache(context, options)
    return action.call(this, context, payload)
  }

/**
 * Create cache with options and define it on store instance.
 * @param {Options} options
 * @returns {(store: Store) => void}
 */
const createCache = options => store => defineCache(store, options)

export default createCache
