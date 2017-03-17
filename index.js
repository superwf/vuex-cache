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

  store.clearCache = function () {
    var type = arguments.length <= 0 ? undefined : arguments[0];
    if (type in cache) {
      delete cache[type];
      return true;
    }
    return false;
  };
});

module.exports = index;
