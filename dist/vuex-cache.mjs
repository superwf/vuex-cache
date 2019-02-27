/*!
 * vuex-cache v3.0.0
 * (c) superwf@gmail.com
 * Released under the MIT License.
 */
/**
 * Check if value is an object.
 * @param {any} value
 * @returns {value is Object}
 */
var isObject = function (value) { return !!value && typeof value === 'object'; };
/**
 * Type alias for Store or ActionContext instances.
 * @typedef {import('vuex').Store<any> | import('vuex').ActionContext<any, any>} Store
 */

/**
 * Convert value to `string`.
 * @param {any} value
 * @returns {string}
 */


var toString = function (value) { return isObject(value) ? JSON.stringify(value) : String(value); };
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


var resolveParams = function (params) { return isObject(params[0]) ? [params[0].type, params[0], params[1]] : params; };
/**
 * Generate key from Dispatch parameters.
 * @param {DispatchParams} params
 * @returns {string}
 */


var generateKey = function (params) {
  var ref = resolveParams(params);
  var type = ref[0];
  var payload = ref[1];
  return (type + ":" + (toString(payload)));
};
/**
 * Check if value has timeout property.
 * @param {any} value
 * @returns {value is { timeout: number }}
 */


var hasTimeout = function (value) { return isObject(value) && typeof value.timeout === 'number'; };
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


var resolveTimeout = function (params, pluginOptions) {
  var dispatchOptions = typeof params[0] === 'string' ? params[2] : params[0];

  if (hasTimeout(dispatchOptions)) {
    return dispatchOptions.timeout;
  } else if (hasTimeout(pluginOptions)) {
    return pluginOptions.timeout;
  }

  return 0;
};
/**
 * Check if value (time) is expired.
 * @param {number} [expiresIn]
 * @returns {boolean}
 */


var isExpired = function (expiresIn) { return !!expiresIn && Date.now() > expiresIn; };
/**
 * Cache's state record.
 * @typedef {{ expiresIn?: number, value: Promise<any> }} CacheRecord
 */

/**
 * Cache's state.
 * @type {Map<string, CacheRecord>}
 */


var state = new Map();
/**
 * Define cache property to store, or action context, object.
 * @param {Store} store
 * @param {Options} [options]
 */

var defineCache = function (store, options) {
  var cache = {
    /**
     * Dispatch an action and set it on cache.
     * @param  {...DispatchParams} params
     * @returns {Promise<any>}
     */
    dispatch: function dispatch() {
      var params = [], len = arguments.length;
      while ( len-- ) params[ len ] = arguments[ len ];

      var key = generateKey(params);
      var ref = state.get(key) || {};
      var value = ref.value;
      var expiresIn = ref.expiresIn;

      if (!!value && !isExpired(expiresIn)) {
        return value;
      }

      var timeout = resolveTimeout(params, options);
      var record = {
        expiresIn: timeout ? Date.now() + timeout : undefined,
        value: store.dispatch.apply(store, params)
      };
      state.set(key, record);
      return record.value.catch(function (error) {
        state.delete(key);
        return Promise.reject(error);
      });
    },

    /**
     * Check if an action dispatch is on cache.
     * @param  {...DispatchParams} params
     * @returns {boolean}
     */
    has: function has() {
      var params = [], len = arguments.length;
      while ( len-- ) params[ len ] = arguments[ len ];

      var record = state.get(generateKey(params));
      return isObject(record) && !isExpired(record.expiresIn);
    },

    /**
     * Clear cache. Returns `true` if cache was cleared and `false` otherwise.
     * @returns {boolean}
     */
    clear: function clear() {
      return state.clear();
    },

    /**
     * Detele an action dispatch from cache. Returns `true` if it was deleted
     * and `false` otherwise.
     * @returns {boolean}
     */
    delete: function delete$1() {
      var params = [], len = arguments.length;
      while ( len-- ) params[ len ] = arguments[ len ];

      var key = generateKey(params);
      return state.delete(key);
    }

  };
  Object.defineProperty(store, 'cache', {
    value: cache,
    writable: false,
    enumerable: true,
    configurable: false
  });
};
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


var cacheAction = function (action, options) { return function (context, payload) {
  defineCache(context, options);
  return action(context, payload);
}; };
/**
 * Create cache with options and define it on store instance.
 * @param {Options} options
 * @returns {(store: Store) => void}
 */

var createCache = function (options) { return function (store) { return defineCache(store, options); }; };

export default createCache;
export { cacheAction };
