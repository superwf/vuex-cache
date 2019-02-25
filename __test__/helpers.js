import { Store } from 'vuex'
import createCache from '../src/index.js'

export const createStore = (actions = {}) => createStoreWithTimeout(0, actions)

export const createStoreWithTimeout = (timeout = 0, actions = {}) =>
  new Store({ plugins: [createCache({ timeout })], actions })

export const createStoreWithModules = (modules = {}) =>
  new Store({ plugins: [createCache()], modules })

export const sleep = time => new Promise(resolve => setTimeout(resolve, time))
