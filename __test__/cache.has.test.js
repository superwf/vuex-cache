import Vue from 'vue'
import Vuex from 'vuex'
import { createStore, createStoreWithTimeout, sleep } from './helpers'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  createStore().cache.clear()
})

describe('store.cache.has', () => {
  it('remove action from cache', async () => {
    let actionWasCalled = 0

    const store = createStore({
      ACTION: () => {
        actionWasCalled++
      },
    })

    await store.cache.dispatch('ACTION')

    expect(actionWasCalled).toBe(1)

    await store.cache.dispatch('ACTION')

    expect(actionWasCalled).toBe(1)

    store.cache.delete('ACTION')

    await store.cache.dispatch('ACTION')

    expect(actionWasCalled).toBe(2)
  })

  it('check if cache has action', () => {
    const store = createStore({
      ACTION: () => {},
    })

    expect(store.cache.has('ACTION')).toBe(false)

    store.cache.dispatch('ACTION')

    expect(store.cache.has('ACTION')).toBe(true)
  })

  it('returns false if action was expired', async () => {
    const store = createStoreWithTimeout(100, {
      ACTION: () => {},
    })

    expect(store.cache.has('ACTION')).toBe(false)

    await store.cache.dispatch('ACTION')

    expect(store.cache.has('ACTION')).toBe(true)

    await sleep(100)

    expect(store.cache.has('ACTION')).toBe(false)
  })

  it("returns false if params don't match cached ones", async () => {
    const store = createStore({
      ACTION() {},
    })

    store.cache.dispatch('ACTION', 10)

    expect(store.cache.has('ACTION', 5)).toBe(false)

    await store.cache.dispatch('ACTION')

    expect(store.cache.has('ACTION', null)).toBe(false)
  })

  it('returns false if params is non JSON parseable', async () => {
    const store = createStore({
      ACTION() {},
    })

    const a = {}
    const b = { a }
    a.b = b

    await store.cache.dispatch('ACTION', a)

    expect(store.cache.has('ACTION', a)).toBe(false)
  })
})
