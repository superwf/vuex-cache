import Vue from 'vue'
import Vuex from 'vuex'
import { createStore } from './helpers'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  createStore().cache.clear()
})

describe('store.cache.delete', () => {
  it("returns false if there's no action to delete", () => {
    const store = createStore()

    expect(store.cache.delete('UNKNOWN')).toBe(false)
  })

  it('returns false if action was already deleted', () => {
    const store = createStore({
      ACTION() {},
    })

    store.cache.dispatch('ACTION')

    store.cache.delete('ACTION')

    expect(store.cache.delete('ACTION')).toBe(false)
  })

  it('returns true if it delete action', async () => {
    const store = createStore({
      ACTION() {},
    })

    store.cache.dispatch('ACTION')

    expect(store.cache.delete('ACTION')).toBe(true)

    await store.cache.dispatch({
      type: 'ACTION',
      quantity: 10,
    })

    expect(
      store.cache.delete({
        type: 'ACTION',
        quantity: 10,
      }),
    ).toBe(true)
  })

  it("returns false if params don't match cached ones", async () => {
    const store = createStore({
      ACTION() {},
    })

    store.cache.dispatch('ACTION', 10)

    expect(store.cache.delete('ACTION', 5)).toBe(false)

    await store.cache.dispatch('ACTION')

    expect(store.cache.delete('ACTION', null)).toBe(false)
  })
})
