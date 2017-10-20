'use strict';

var index = (function (store) {
  store.cache = new Map();

  store.cache.dispatch = function () {
    var type = arguments[0];
    if (!store.cache.has(type)) {
      store.cache.set(type, store.dispatch.apply(store, arguments));
    }
    return store.cache.get(type);
  };
});

module.exports = index;
