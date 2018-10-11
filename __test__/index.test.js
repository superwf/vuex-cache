import Vue from 'vue'
import Vuex from 'vuex'
import vuexCache from '../src'

Vue.use(Vuex)

describe('cache vuex action', () => {
  const result = [1, 2, 3]
  let store, spy, moduleASpy

  beforeEach(() => {
    spy = jest.fn(() => {
      return Promise.resolve(result)
    })

    moduleASpy = jest.fn(() => {
      return Promise.resolve()
    })

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
    store = new Vuex.Store({
      state: {
        list: [],
        name: '',
      },

      plugins: [vuexCache],

      mutations: {
        LIST(state, payload) {
          state.list = payload
        },
        NAME(state, payload) {
          state.name = payload
        },
      },

      modules: {
        moduleA,
      },

      actions: {
        LIST({ commit }) {
          spy().then(list => {
            commit('LIST', list)
          })
        },
        NAME({ commit }, name) {
          commit('NAME', name)
        },
      },
    })
  })

  it('cache action', done => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    store.cache.dispatch('LIST', 1, 2)
    expect(dispatchSpy).toHaveBeenCalledWith('LIST', 1, 2)
    expect(spy.mock.calls).toHaveLength(1)
    store.cache.dispatch('LIST')
    expect(spy.mock.calls).toHaveLength(2)

    Vue.nextTick(() => {
      expect(store.state.list).toEqual(result)
      dispatchSpy.mockRestore()
      done()
    })
  })

  it('remove cache return true', () => {
    store.cache.dispatch('LIST')
    expect(spy.mock.calls).toHaveLength(1)
    expect(store.cache.delete('LIST')).toBe(true)
    expect(store.cache.delete('LIST')).toBe(false)
    store.cache.dispatch('LIST')
    expect(spy.mock.calls).toHaveLength(2)
    store.cache.dispatch('LIST')
    expect(spy.mock.calls).toHaveLength(2)
  })

  it('remove cache not exist, return false', () => {
    expect(store.cache.delete('NO_TYPE')).toBe(false)
  })

  it('clear all cache', () => {
    store.cache.dispatch('LIST')
    store.cache.dispatch('NAME', 'abc')
    expect(store.cache.has('LIST')).toBe(true)
    expect(store.cache.has('NAME', 'abc')).toBe(true)
    store.cache.clear()
    expect(store.cache.has('LIST')).toBe(false)
    expect(store.cache.has('NAME', 'abc')).toBe(false)
  })

  it('cache object param', () => {
    store.cache.dispatch({
      type: 'LIST',
      page: 1,
    })
    store.cache.dispatch({
      type: 'LIST',
      page: 1,
    })
    store.cache.dispatch({
      type: 'LIST',
      page: 2,
    })
    expect(spy.mock.calls).toHaveLength(2)
  })

  it('delete cache with object', () => {
    store.cache.dispatch({
      type: 'LIST',
      page: 1,
    })
    expect(spy.mock.calls).toHaveLength(1)
    expect(
      store.cache.delete({
        type: 'LIST',
        page: 1,
      }),
    ).toBe(true)
    expect(
      store.cache.delete({
        type: 'LIST',
        page: 1,
      }),
    ).toBe(false)
  })

  it('delete cache with two params', () => {
    store.cache.dispatch('LIST', 1)
    expect(spy.mock.calls).toHaveLength(1)
    expect(store.cache.has('LIST', 1)).toBe(true)
    expect(store.cache.delete('LIST', 1)).toBe(true)
    expect(store.cache.delete('LIST', 1)).toBe(false)
  })

  it('has/clear cache with object', () => {
    store.cache.dispatch({
      type: 'LIST',
      page: 1,
    })
    store.cache.dispatch({
      type: 'LIST',
      page: 2,
    })
    expect(
      store.cache.has({
        type: 'LIST',
        page: 1,
      }),
    ).toBe(true)
    expect(
      store.cache.has({
        type: 'LIST',
        page: 2,
      }),
    ).toBe(true)
    store.cache.clear()
    expect(
      store.cache.has({
        type: 'LIST',
        page: 1,
      }),
    ).toBe(false)
    expect(
      store.cache.has({
        type: 'LIST',
        page: 2,
      }),
    ).toBe(false)
  })

  it('has two arguments', () => {
    store.cache.dispatch('LIST', { page: 1 })
    store.cache.dispatch('LIST', { page: 1 })
    expect(spy.mock.calls).toHaveLength(1)
    store.cache.dispatch('LIST', { page: 2 })
    store.cache.dispatch('LIST', { page: 2 })
    expect(spy.mock.calls).toHaveLength(2)
  })

  it('test cache dispatch for module', done => {
    expect(store.state.moduleA.members).toEqual([])
    Promise.all([
      store.cache.dispatch('MODULEA_ADD_MEMBER', 1),
      store.cache.dispatch('MODULEA_ADD_MEMBER', 1),
      store.cache.dispatch('MODULEA_ADD_MEMBER', 1),
    ]).then(() => {
      expect(store.state.moduleA.members).toEqual([1])
      expect(moduleASpy).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
