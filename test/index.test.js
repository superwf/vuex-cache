import expect, { createSpy, spyOn } from 'expect'
import Vue from 'vue'
import Vuex from 'vuex'
import vuexCache from '../src'

Vue.use(Vuex)

describe('cache vuex action', () => {
  const result = [1, 2, 3]
  let store, spy

  beforeEach(() => {
    spy = createSpy().andCall(() => {
      return Promise.resolve(result)
    })
    store = new Vuex.Store({
      state: {
        list: [],
        name: ''
      },

      plugins: [vuexCache],

      mutations: {
        LIST (state, payload) {
          state.list = payload
        },
        NAME (state, payload) {
          state.name = payload
        }
      },

      actions: {
        LIST ({ commit }) {
          spy().then(list => {
            commit('LIST', list)
          })
        },
        NAME ({ commit }, name) {
          commit('NAME', name)
        }
      }
    })
  })

  it('cache action', done => {
    const dispatchSpy = spyOn(store, 'dispatch').andCallThrough()
    store.cache.dispatch('LIST', 1, 2)
    expect(dispatchSpy).toHaveBeenCalledWith('LIST', 1, 2)
    expect(spy.calls.length).toBe(1)
    store.cache.dispatch('LIST')
    expect(spy.calls.length).toBe(1)

    Vue.nextTick(() => {
      expect(store.state.list).toEqual(result)
      dispatchSpy.restore()
      done()
    })
  })

  it('remove cache return true', () => {
    store.cache.dispatch('LIST')
    expect(spy.calls.length).toBe(1)
    expect(store.cache.delete('LIST')).toBe(true)
    expect(store.cache.delete('LIST')).toBe(false)
    store.cache.dispatch('LIST')
    expect(spy.calls.length).toBe(2)
    store.cache.dispatch('LIST')
    expect(spy.calls.length).toBe(2)
  })

  it('remove cache not exist, return false', () => {
    expect(store.cache.delete('NO_TYPE')).toBe(false)
  })

  it('clear all cache', () => {
    store.cache.dispatch('LIST')
    store.cache.dispatch('NAME', 'abc')
    expect(store.cache.has('LIST')).toBe(true)
    expect(store.cache.has('NAME')).toBe(true)
    store.cache.clear()
    expect(store.cache.has('LIST')).toBe(false)
    expect(store.cache.has('NAME')).toBe(false)
  })
})
