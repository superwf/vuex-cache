import { Store } from 'vuex'
import createCache from '../src/vuex-cache.js'

export const createStore = (actions = {}) => {
  return createStoreWithTimeout(0, actions)
}

export const createStoreWithTimeout = (timeout = 0, actions = {}) => {
  return new Store({ plugins: [createCache({ timeout })], actions })
}

export const createStoreWithModules = (modules = {}) => {
  return new Store({ plugins: [createCache()], modules })
}

export const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}
