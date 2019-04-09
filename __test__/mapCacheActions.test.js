import Vue from 'vue'
import Vuex from 'vuex'
import { mapCacheActions } from '../src/vuex-cache.js';
import createCache from '../src/vuex-cache.js'

beforeAll(() => {
  Vue.use(Vuex)
})

describe('mapCacheActions', () => {
  it('mapCacheActions (object)', () => {
    const a = jest.fn();
    const b = jest.fn();
    const store = new Vuex.Store({
      plugins: [createCache()],
      actions: {
        a,
        b
      }
    })
    const vm = new Vue({
      store,
      methods: mapCacheActions({
        foo: 'a',
        bar: 'b'
      })
    })
    vm.foo()
    expect(a).toHaveBeenCalled()
    expect(b).not.toHaveBeenCalled()
    vm.bar()
    expect(b).toHaveBeenCalled()
  })

  it('mapCacheActions (function)', () => {
    const a = jest.fn()
    const store = new Vuex.Store({
      plugins: [createCache()],
      actions: { a }
    })
    const vm = new Vue({
      store,
      methods: mapCacheActions({
        foo (dispatch, arg) {
          dispatch('a', arg + 'bar')
        }
      })
    })
    vm.foo('foo')
    expect(a.mock.calls[0][1]).toBe('foobar')
  })

  it('mapCacheActions (with namespace)', () => {
    const a = jest.fn()
    const b = jest.fn()
    const store = new Vuex.Store({
      plugins: [createCache()],
      modules: {
        foo: {
          namespaced: true,
          actions: {
            a,
            b
          }
        }
      }
    })
    const vm = new Vue({
      store,
      methods: mapCacheActions('foo/', {
        foo: 'a',
        bar: 'b'
      })
    })
    vm.foo()
    expect(a).toHaveBeenCalled()
    expect(b).not.toHaveBeenCalled()
    vm.bar()
    expect(b).toHaveBeenCalled()
  })

  it('mapCacheActions (function with namespace)', () => {
    const a = jest.fn()
    const store = new Vuex.Store({
      plugins: [createCache()],
      modules: {
        foo: {
          namespaced: true,
          actions: { a }
        }
      }
    })
    const vm = new Vue({
      store,
      methods: mapCacheActions('foo/', {
        foo (dispatch, arg) {
          dispatch('a', arg + 'bar')
        }
      })
    })
    vm.foo('foo')
    expect(a.mock.calls[0][1]).toBe('foobar')
  })
})
