(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.VuexCache = {}));
}(this, (function (exports) { 'use strict';

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

  var GenerateKeyError = new Error("Can't generate key from parameters.");
  /**
   * Generate key from Dispatch parameters.
   * @param {DispatchParams} params
   * @returns {string|Error}
   */

  var generateKey = function (params) {
    try {
      var ref = resolveParams(params);
      var type = ref[0];
      var payload = ref[1];
      return (type + ":" + (toString(payload)));
    } catch (_) {
      return GenerateKeyError;
    }
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

        if (key === GenerateKeyError) {
          // Fallback on generateKey errors.
          return store.dispatch.apply(store, params);
        }

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

        var key = generateKey(params);

        if (key === GenerateKeyError) {
          // Fallback on generateKey errors.
          return false;
        }

        var record = state.get(key);
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

        if (key === GenerateKeyError) {
          // Fallback on generateKey errors.
          return false;
        }

        return state.delete(key);
      }

    };
    Object.defineProperty(store, 'cache', {
      value: cache,
      writable: false,
      enumerable: true,
      configurable: false
    });

    for (var namespace in store._modulesNamespaceMap) {
      var module = getModuleByNamespace(store, 'mapCacheActions', namespace);
      Object.defineProperty(module.context, 'cache', {
        value: cache,
        writable: false,
        enumerable: true,
        configurable: false
      });
    }
  };
  /**
   * Normalize the map
   * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
   * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
   * @param {Array|Object} map
   * @return {Object}
   */


  var normalizeMap = function (map) {
    return Array.isArray(map) ? map.map(function (key) { return ({
      key: key,
      val: key
    }); }) : Object.keys(map).map(function (key) { return ({
      key: key,
      val: map[key]
    }); });
  };
  /**
   * Search a special module from store by namespace. if module not exist, print error message.
   * @param {Object} store
   * @param {String} helper
   * @param {String} namespace
   * @return {Object}
   */


  var getModuleByNamespace = function (store, helper, namespace) {
    var module = store._modulesNamespaceMap[namespace];

    if ( !module) {
      console.error(("[vuex-cache] module namespace not found in " + helper + "(): " + namespace));
    }

    return module;
  };
  /**
   * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
   * @param {Function} fn
   * @return {Function}
   */


  var normalizeNamespace = function (fn) {
    return function (namespace, map) {
      if (typeof namespace !== 'string') {
        map = namespace;
        namespace = '';
      } else if (namespace.charAt(namespace.length - 1) !== '/') {
        namespace += '/';
      }

      return fn(namespace, map);
    };
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
    return action.call(this, context, payload);
  }; };
  /**
   * Create cache actions object to map to a component
   * @param {String} namespace
   * @param {Array} actions
   * @returns {Object}
   */

  var mapCacheActions = normalizeNamespace(function (namespace, actions) {
    var res = {};
    normalizeMap(actions).forEach(function (ref) {
      var key = ref.key;
      var val = ref.val;

      res[key] = function mappedAction() {
        var this$1 = this;
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var dispatch = this.$store.cache.dispatch;

        if (namespace) {
          var module = getModuleByNamespace(this.$store, 'mapCacheActions', namespace);

          if (!module) {
            return;
          } // dispatch = module.context.cache.dispatch;


          dispatch = typeof val === 'function' ? function (type) {
            var ref;

            var payload = [], len = arguments.length - 1;
            while ( len-- > 0 ) payload[ len ] = arguments[ len + 1 ];
            (ref = module.context.cache.dispatch).call.apply(ref, [ this$1.$store.cache, ("" + namespace + type) ].concat( payload ));
          } : module.context.cache.dispatch;
        }

        return typeof val === 'function' ? val.call.apply(val, [ this, dispatch ].concat( args )) : dispatch.call.apply(dispatch, [ this.$store.cache, ("" + namespace + val) ].concat( args ));
      };
    });
    return res;
  });
  /**
   * Create cache with options and define it on store instance.
   * @param {Options} options
   * @returns {(store: Store) => void}
   */

  var createCache = function (options) { return function (store) { return defineCache(store, options); }; };

  exports.cacheAction = cacheAction;
  exports.default = createCache;
  exports.mapCacheActions = mapCacheActions;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
