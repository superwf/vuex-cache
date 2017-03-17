import expect, { createSpy } from 'expect'
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
        list: []
      },

      plugins: [vuexCache],

      mutations: {
        LIST (state, payload) {
          state.list = payload
        }
      },

      actions: {
        LIST ({ commit }) {
          spy().then(list => {
            commit('LIST', list)
          })
        }
      }
    })
  })

  it('cache action', done => {
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)

    Vue.nextTick(() => {
      expect(store.state.list).toEqual(result)
      done()
    })
  })

  it('clear cache', () => {
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)
    store.clearCache('LIST')
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(2)
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(2)
  })
})
