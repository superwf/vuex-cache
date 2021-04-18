import Vue from 'vue'
import Vuex from 'vuex'
import { createStore } from './helpers'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  createStore().cache.clear()
})

describe('store.cache.clear', () => {
  it('clear all action dispatches from cache', () => {
    const store = createStore({
      A: () => {},
      B: () => {},
    })

    store.cache.dispatch('A')
    store.cache.dispatch('B', { name: '@superwf' })

    expect(store.cache.has('A')).toBe(true)
    expect(store.cache.has('B', { name: '@superwf' })).toBe(true)

    store.cache.clear()

    expect(store.cache.has('A')).toBe(false)
    expect(store.cache.has('B', { name: '@superwf' })).toBe(false)

    store.cache.dispatch('A')
    store.cache.dispatch('B', { name: '@superwf1' })
    store.cache.dispatch('B', { name: '@superwf2' })

    expect(store.cache.has('A')).toBe(true)
    expect(store.cache.has('B', { name: '@superwf1' })).toBe(true)
    expect(store.cache.has('B', { name: '@superwf2' })).toBe(true)

    const count = store.cache.clear('B')

    expect(count).toBe(2)
    expect(store.cache.has('A')).toBe(true)
    expect(store.cache.has('B', { name: '@superwf1' })).toBe(false)
    expect(store.cache.has('B', { name: '@superwf2' })).toBe(false)
  })
})
