/**
 * Check if value is an object.
 * @param {any} value
 * @returns {value is Object}
 */
const isObject = (value) => {
  return !!value && typeof value === 'object'
}

/**
 * Type alias for Store or ActionContext instances.
 * @typedef {import('vuex').Store<any> | import('vuex').ActionContext<any, any>} Store
 */

/**
 * Convert value to `string`.
 * @param {any} value
 * @returns {string}
 */
const toString = (value) => {
  return isObject(value) ? JSON.stringify(value) : String(value)
}

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
const resolveParams = (params) => {
  return isObject(params[0]) ? [params[0].type, params[0], params[1]] : params
}

const GenerateKeyError = new Error("Can't generate key from parameters.")

/**
 * Generate key from Dispatch parameters.
 * @param {DispatchParams} params
 * @returns {string|Error}
 */
const generateKey = (params) => {
  try {
    const [type, payload] = resolveParams(params)
    return `${type}:${toString(payload)}`
  } catch (_) {
    return GenerateKeyError
  }
}

/**
 * Check if value has timeout property.
 * @param {any} value
 * @returns {value is { timeout: number }}
 */
const hasTimeout = (value) => {
  return isObject(value) && typeof value.timeout === 'number'
}

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
const isExpired = (expiresIn) => {
  return !!expiresIn && Date.now() > expiresIn
}

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

      if (key === GenerateKeyError) {
        // Fallback on generateKey errors.
        return store.dispatch.apply(store, params)
      }

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

      return record.value.catch((error) => {
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
      const key = generateKey(params)

      if (key === GenerateKeyError) {
        // Fallback on generateKey errors.
        return false
      }

      const record = state.get(key)
      return isObject(record) && !isExpired(record.expiresIn)
    },

    /**
     * Clear cache. Returns `true` if cache was cleared and `false` otherwise.
     * If using the type parameter, only actions with the specified type are
     * deleted from cache and the number of deleted keys is returned.
     * @returns {boolean|number}
     */
    clear(...params) {
      const [type] = resolveParams(params)
      if (type) {
        return Array.from(state.keys())
          .filter((key) => key.split(':')[0] === type)
          .reduce((count, key) => count + state.delete(key), 0)
      }
      return !!state.clear()
    },

    /**
     * Delete an action dispatch from cache. Returns `true` if it was deleted
     * and `false` otherwise.
     * @returns {boolean}
     */
    delete(...params) {
      const key = generateKey(params)

      if (key === GenerateKeyError) {
        // Fallback on generateKey errors.
        return false
      }

      return state.delete(key)
    },

    state() {
      return state
    },
  }

  Object.defineProperty(store, 'cache', {
    value: cache,
    writable: false,
    enumerable: true,
    configurable: false,
  })

  for (const namespace in store._modulesNamespaceMap) {
    const module = getModuleByNamespace(store, 'mapCacheActions', namespace)

    Object.defineProperty(module.context, 'cache', {
      value: cache,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */
const normalizeMap = (map) => {
  return Array.isArray(map)
    ? map.map((key) => ({ key, val: key }))
    : Object.keys(map).map((key) => ({ key, val: map[key] }))
}

/**
 * Search a special module from store by namespace. if module not exist, print error message.
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
const getModuleByNamespace = (store, helper, namespace) => {
  const module = store._modulesNamespaceMap[namespace]
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(
      `[vuex-cache] module namespace not found in ${helper}(): ${namespace}`,
    )
  }
  return module
}

/**
 * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
 * @param {Function} fn
 * @return {Function}
 */
const normalizeNamespace = (fn) => {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
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
  function (context, payload) {
    defineCache(context, options)
    return action.call(this, context, payload)
  }

/**
 * Create cache actions object to map to a component
 * @param {String} namespace
 * @param {Array} actions
 * @returns {Object}
 */
export const mapCacheActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction(...args) {
      let dispatch = this.$store.cache.dispatch

      if (namespace) {
        const module = getModuleByNamespace(
          this.$store,
          'mapCacheActions',
          namespace,
        )
        if (!module) {
          return
        }
        // dispatch = module.context.cache.dispatch;
        dispatch =
          typeof val === 'function'
            ? (type, ...payload) => {
                module.context.cache.dispatch.call(
                  this.$store.cache,
                  `${namespace}${type}`,
                  ...payload,
                )
              }
            : module.context.cache.dispatch
      }

      return typeof val === 'function'
        ? val.call(this, dispatch, ...args)
        : dispatch.call(this.$store.cache, `${namespace}${val}`, ...args)
    }
  })
  return res
})

/**
 * Create cache with options and define it on store instance.
 * @param {Options} options
 * @returns {(store: Store) => void}
 */
const createCache = (options) => (store) => defineCache(store, options)

export default createCache
