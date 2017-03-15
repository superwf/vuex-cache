import expect, { createSpy } from 'expect'
import Vue from 'vue'
import Vuex from 'vuex'
import memorize from '../src'

Vue.use(Vuex)

describe('memorize vuex action', () => {
  it('memory action', done => {

    const result = [1, 2, 3]
    const spy = createSpy().andCall(() => {
      return Promise.resolve(result)
    })

    const store = new Vuex.Store({
      state: {
        list: []
      },

      plugins: [memorize],

      mutations: {
        list (state, payload) {
          state.list = payload
        }
      },

      actions: {
        list ({ commit }) {
          spy().then(list => {
            commit('list', list)
          })
        }
      }
    })

    store.cacheDispatch('list')
    expect(spy.calls.length).toBe(1)
    store.cacheDispatch('list')
    expect(spy.calls.length).toBe(1)

    setTimeout(() => {
      expect(store.state.list).toEqual(result)
      done()
    })
  })
})
