import Vue from 'vue'
import Vuex from 'vuex'
import { createStore } from './helpers'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  createStore().cache.clear()
})

describe('store.cache.state', () => {
  it('state before & after dispatches', () => {
    let val = 'foo'

    const store = createStore({
      action: () => {
        val = 'bar'
      },
    })

    expect(store.cache.state()).toBeDefined()
    expect(store.cache.state().size).toBe(0)

    store.cache.dispatch('action', 'foobar')

    expect(val).toBe('bar')
    expect(store.cache.state().size).toBe(1)
  })
})
