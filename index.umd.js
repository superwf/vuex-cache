(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global['vuex-cache'] = factory());
}(this, (function () { 'use strict';

  // convert string or obj to string
  var toString = function toString(arg) {
    return typeof arg === 'string' ? arg : JSON.stringify(arg);
  }; // convert arguments to string


  var argsToString = function argsToString(args) {
    var type = toString(args[0]);

    if (args[1]) {
      type = "".concat(type, ":").concat(toString(args[1]));
    }

    return type;
  };

  var index = (function (store) {
    var cache = new Map();

    cache.dispatch = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var type = argsToString(args);

      if (!cache.has(type)) {
        cache.set(type, store.dispatch.apply(store, args));
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
  });

  return index;

})));
