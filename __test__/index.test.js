import Vue from 'vue'
import Vuex from 'vuex'
import createCache, { cacheAction } from '../src'

Vue.use(Vuex)

describe('cache vuex action', () => {
  const result = [1, 2, 3]
  let store, listSpy, moduleASpy

  const moduleA = {
    state: {
      members: [],
    },
    mutations: {
      MODULEA_ADD_MEMBER(state, payload) {
        state.members.push(payload)
      },
    },
    actions: {
      MODULEA_ADD_MEMBER({ commit }, value) {
        return moduleASpy().then(() => {
          commit('MODULEA_ADD_MEMBER', value)
        })
      },
    },
  }

  const storeOption = {
    state: {
      list: [],
      name: '',
    },

    plugins: [createCache],

    mutations: {
      LIST(state, payload) {
        state.list = payload
      },
      NAME(state, { name }) {
        state.name = name
      },
    },

    modules: {
      moduleA,
    },

    actions: {
      LIST({ commit }) {
        listSpy().then(list => {
          commit('LIST', list)
        })
      },
      NAME({ commit }, name) {
        commit('NAME', name)
      },
      ENHANCED_ACTION_TEST: cacheAction(context => {
        context.cache.dispatch('LIST', 1, 2)
        expect(listSpy.mock.calls).toHaveLength(1)
        context.cache.dispatch('LIST')
        expect(listSpy.mock.calls).toHaveLength(2)
      }),
    },
  }

  beforeEach(() => {
    listSpy = jest.fn(() => {
      return Promise.resolve(result)
    })

    moduleASpy = jest.fn(() => {
      return Promise.resolve()
    })
    store = new Vuex.Store(storeOption)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('is bound to action context', done => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    store.dispatch('ENHANCED_ACTION_TEST')
    expect(dispatchSpy).toHaveBeenCalledWith('ENHANCED_ACTION_TEST')

    Vue.nextTick(() => {
      expect(store.state.list).toEqual(result)
      done()
    })
  })
})
