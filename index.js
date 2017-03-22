'use strict';

var index = (function (store) {
  var cache = Object.create(null);
  store.cacheDispatch = function () {
    var type = arguments.length <= 0 ? undefined : arguments[0];
    if (type in cache) {
      return cache[type];
    }
    cache[type] = store.dispatch.apply(store, arguments);
    return cache[type];
  };

  store.removeCache = function () {
    var type = arguments.length <= 0 ? undefined : arguments[0];
    if (type in cache) {
      delete cache[type];
      return true;
    }
    return false;
  };

  store.hasCache = function (key) {
    return key in cache;
  };

  store.clearCache = function () {
    for (var key in cache) {
      delete cache[key];
    }
    return true;
  };
});

module.exports = index;
