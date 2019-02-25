import Vue from 'vue'
import Vuex from 'vuex'
import createCache from '../src'

beforeAll(() => {
  Vue.use(Vuex)
})

describe('createCache', () => {
  it('is a function to create store plugin', () => {
    expect(typeof createCache).toBe('function')
    expect(typeof createCache()).toBe('function')
  })

  it('define cache property on store', () => {
    const store = {}

    createCache()(store)

    expect(store).toHaveProperty('cache')
    expect(typeof store.cache.has).toBe('function')
    expect(typeof store.cache.clear).toBe('function')
    expect(typeof store.cache.delete).toBe('function')
    expect(typeof store.cache.dispatch).toBe('function')
  })
})
