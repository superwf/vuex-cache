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
    store.cacheDispatch('LIST', 1, 2)
    expect(dispatchSpy).toHaveBeenCalledWith('LIST', 1, 2)
    expect(spy.calls.length).toBe(1)
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)

    Vue.nextTick(() => {
      expect(store.state.list).toEqual(result)
      dispatchSpy.restore()
      done()
    })
  })

  it('remove cache return true', () => {
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)
    expect(store.removeCache('LIST')).toBe(true)
    expect(store.removeCache('LIST')).toBe(false)
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(2)
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(2)
  })

  it('remove cache not exist, return false', () => {
    expect(store.removeCache('NO_TYPE')).toBe(false)
  })

  it('clear all cache', () => {
    store.cacheDispatch('LIST')
    store.cacheDispatch('NAME', 'abc')
    expect(store.hasCache('LIST')).toBe(true)
    expect(store.hasCache('NAME')).toBe(true)
    store.clearCache()
    expect(store.hasCache('LIST')).toBe(false)
    expect(store.hasCache('NAME')).toBe(false)
  })
})
