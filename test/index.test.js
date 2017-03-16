import expect, { createSpy } from 'expect'
import Vue from 'vue'
import Vuex from 'vuex'
import vuexCache from '../src'

Vue.use(Vuex)

describe('cache vuex action', () => {
  it('memory action', done => {

    const result = [1, 2, 3]
    const spy = createSpy().andCall(() => {
      return Promise.resolve(result)
    })

    const store = new Vuex.Store({
      state: {
        list: []
      },

      plugins: [vuexCache],

      mutations: {
        list (state, payload) {
          state.list = payload
        }
      },

      actions: {
        list ({ commit }) {
          spy().then(list => {
            commit('LIST', list)
          })
        }
      }
    })

    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)
    store.cacheDispatch('LIST')
    expect(spy.calls.length).toBe(1)

    Vue.nextTick(() => {
      expect(store.state.list).toEqual(result)
      done()
    })
  })
})
