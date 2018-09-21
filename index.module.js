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

var index = store => {
  const cache = new Map();

  cache.dispatch = (...args) => {
    const type = argsToString(args);
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
