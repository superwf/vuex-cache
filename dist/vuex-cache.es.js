/*!
 * vuex-cache v2.1.0
 * (c) 2018-present superwf@gmail.com
 * Released under the MIT License.
 */
var isVuexStore = function isVuexStore(obj) {
  return 'dispatch' in obj && typeof obj.dispatch === 'function';
}; // convert string or obj to string


var toString = function toString(arg) {
  return typeof arg === 'string' ? arg : JSON.stringify(arg);
}; // convert arguments to string


var argsToString = function argsToString(args) {
  var type = toString(args[0]);

  if (args[1]) {
    type = "".concat(type, ":").concat(toString(args[1]));
  }

  return type;
}; // parse timeout prop in option


var getTimeout = function getTimeout(args, option) {
  if (args.length === 1 && args[0].timeout) {
    return args[0].timeout;
  }

  if (args.length === 3 && args[2].timeout) {
    return args[2].timeout;
  }

  if (option && option.timeout) {
    return option.timeout;
  }

  return 0;
};

var cachePlugin = function cachePlugin(store, option) {
  var cache = new Map(); // use another map to store timeout for each type

  var timeoutCache = new Map();

  cache.dispatch = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var type = argsToString(args);
    var timeout = getTimeout(args, option);

    if (timeout) {
      var now = Date.now();

      if (!timeoutCache.has(type)) {
        timeoutCache.set(type, now);
      } else {
        var timeoutOfCurrentType = timeoutCache.get(type); // console.log(now - timeout, timeoutOfCurrentType)

        if (now - timeout > timeoutOfCurrentType) {
          cache.delete(type);
          timeoutCache.delete(type);
        }
      }
    }

    if (!cache.has(type)) {
      var action = store.dispatch.apply(store, args).catch(function (error) {
        cache.delete(type);
        return Promise.reject(error);
      });
      cache.set(type, action);
    }

    return cache.get(type);
  };

  var _has = cache.has.bind(cache);

  cache.has = function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var key = argsToString(args);
    return _has(toString(key));
  };

  var _delete = cache.delete.bind(cache);

  cache.delete = function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var key = argsToString(args);
    return _delete(toString(key));
  };

  store.cache = cache;
};

var resolveParams = function resolveParams(args) {
  if (!isVuexStore(args)) {
    return function (store) {
      return cachePlugin(store, args);
    };
  }

  return cachePlugin(args);
}; // expose plugin as default

function cacheAction(action) {
  return function cacheEnhancedAction(context, payload) {
    cachePlugin(context);
    return action(context, payload);
  };
}

export default resolveParams;
export { cacheAction };
