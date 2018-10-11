// convert string or obj to string
const toString = arg => (typeof arg === 'string' ? arg : JSON.stringify(arg));

// convert arguments to string
const argsToString = args => {
  let type = toString(args[0]);
  if (args[1]) {
    type = `${type}:${toString(args[1])}`;
  }
  return type
};

// parse timeout prop in option
const getTimeout = args => {
  if (args.length === 1 && args[0].timeout) {
    return args[0].timeout
  }
  if (args.length === 3 && args[2].timeout) {
    return args[2].timeout
  }
  return 0
};

var index = store => {
  const cache = new Map();
  // use another map to store timeout for each type
  const timeoutCache = new Map();

  cache.dispatch = (...args) => {
    const type = argsToString(args);

    const timeout = getTimeout(args);
    if (timeout) {
      const now = Date.now();
      if (!timeoutCache.has(type)) {
        timeoutCache.set(type, now);
      } else {
        const timeoutOfCurrentType = timeoutCache.get(type);
        // console.log(now - timeout, timeoutOfCurrentType)
        if (now - timeout > timeoutOfCurrentType) {
          cache.delete(type);
          timeoutCache.delete(type);
        }
      }
    }

    if (!cache.has(type)) {
      cache.set(type, store.dispatch.apply(store, args));
    }
    return cache.get(type)
  };

  const _has = cache.has.bind(cache);
  cache.has = (...args) => {
    const key = argsToString(args);
    return _has(toString(key))
  };

  const _delete = cache.delete.bind(cache);
  cache.delete = (...args) => {
    const key = argsToString(args);
    return _delete(toString(key))
  };

  store.cache = cache;
};

export default index;
