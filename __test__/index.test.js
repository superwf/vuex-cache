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

  describe('add timeout configuration', () => {
    const sleep = time => new Promise(resolve => setTimeout(resolve, time))
    it('object format param', async () => {
      await store.cache.dispatch({
        type: 'LIST',
        timeout: 100,
      })
      await store.cache.dispatch({
        type: 'LIST',
        timeout: 100,
      })
      expect(listSpy).toHaveBeenCalledTimes(1)

      await sleep(110)
      await store.cache.dispatch({
        type: 'LIST',
        timeout: 100,
      })
      await store.cache.dispatch({
        type: 'LIST',
        timeout: 100,
      })
      expect(listSpy).toHaveBeenCalledTimes(2)

      await sleep(90)
      await store.cache.dispatch({
        type: 'LIST',
        timeout: 100,
      })
      await store.cache.dispatch({
        type: 'LIST',
        timeout: 100,
      })
      expect(listSpy).toHaveBeenCalledTimes(2)
    })

    it('three param', async () => {
      await store.cache.dispatch('LIST', null, {
        timeout: 100,
      })
      await store.cache.dispatch('LIST', null, {
        timeout: 100,
      })
      expect(listSpy).toHaveBeenCalledTimes(1)

      await sleep(110)
      await store.cache.dispatch('LIST', null, {
        timeout: 100,
      })
      await store.cache.dispatch('LIST', null, {
        timeout: 100,
      })
      expect(listSpy).toHaveBeenCalledTimes(2)

      await sleep(90)
      await store.cache.dispatch('LIST', null, {
        timeout: 100,
      })
      await store.cache.dispatch('LIST', null, {
        timeout: 100,
      })
      expect(listSpy).toHaveBeenCalledTimes(2)
    })

    it('test default option for timeout', async () => {
      store = new Vuex.Store({
        ...storeOption,
        plugins: [createCache({ timeout: 100 })],
      })

      await store.cache.dispatch('LIST', null)
      await store.cache.dispatch('LIST', null)
      expect(listSpy).toHaveBeenCalledTimes(1)
      await sleep(110)
      await store.cache.dispatch('LIST', null)
      await store.cache.dispatch('LIST', null)
      await sleep(50)
      await store.cache.dispatch('LIST', null)
      expect(listSpy).toHaveBeenCalledTimes(2)

      await sleep(210)
      await store.cache.dispatch('LIST', null)
      await store.cache.dispatch('LIST', null)
      await store.cache.dispatch('LIST', null)
      expect(listSpy).toHaveBeenCalledTimes(3)
    })

    it('overwrite default timeout option on each dispatch', async () => {
      store = new Vuex.Store({
        ...storeOption,
        plugins: [createCache({ timeout: 100 })],
      })

      await store.cache.dispatch('LIST', null, {
        timeout: 200,
      })
      await sleep(110)
      await store.cache.dispatch('LIST', null, {
        timeout: 200,
      })
      expect(listSpy).toHaveBeenCalledTimes(1)

      await sleep(100)
      await store.cache.dispatch('LIST', null, {
        timeout: 200,
      })
      expect(listSpy).toHaveBeenCalledTimes(2)
    })
  })
})
