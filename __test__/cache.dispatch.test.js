import Vue from 'vue'
import Vuex from 'vuex'
import { createStore, createStoreWithModules } from './helpers'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  createStore().cache.clear()
})

describe('store.cache.dispatch', () => {
  it('dispatches the action', () => {
    let actionWasCalledTimes = 0

    const store = createStore({
      action: () => {
        actionWasCalledTimes++
      },
    })

    expect(actionWasCalledTimes).toBe(0)

    store.cache.dispatch('action')

    expect(actionWasCalledTimes).toBe(1)
  })

  it('can call dispatch with payload instead of params', () => {
    let actionWasCalledTimes = 0

    const store = createStore({
      action: () => {
        actionWasCalledTimes++
      },
    })

    expect(actionWasCalledTimes).toBe(0)

    store.cache.dispatch({ type: 'action' })

    expect(actionWasCalledTimes).toBe(1)
  })

  it('action dispatch with payload use type + payload to create key', () => {
    const store = createStore({
      action: () => {},
    })

    expect(store.cache.has('action')).toBeFalsy()
    expect(store.cache.has({ type: 'action' })).toBeFalsy()
    expect(store.cache.has('action', { type: 'action' })).toBeFalsy()

    store.cache.dispatch({ type: 'action' })

    expect(store.cache.has('action')).toBeFalsy()
    expect(store.cache.has({ type: 'action' })).toBeTruthy()
    expect(store.cache.has('action', { type: 'action' })).toBeTruthy()
  })

  it('set action dispatch on cache', () => {
    const store = createStore({
      action: () => {},
    })

    expect(store.cache.has('action')).toBeFalsy()
    expect(store.cache.has({ type: 'action' })).toBeFalsy()

    store.cache.dispatch('action')

    expect(store.cache.has('action')).toBeTruthy()
    expect(store.cache.has({ type: 'action' })).toBeFalsy()

    store.cache.dispatch({ type: 'action' })

    expect(store.cache.has('action')).toBeTruthy()
    expect(store.cache.has({ type: 'action' })).toBeTruthy()
  })

  it('return from cache after first dispatch', async () => {
    let _id = 0
    const store = createStore({
      action: () => {
        _id++
        return _id
      },
    })

    expect(await store.cache.dispatch('action')).toBe(1)
    expect(await store.cache.dispatch('action')).toBe(1)

    store.cache.delete('action')

    expect(await store.cache.dispatch('action')).toBe(2)
    expect(await store.cache.dispatch('action')).toBe(2)
  })

  it("use payload to generate cache's key with fake request answers", async () => {
    let _id = 0
    const store = createStore({
      action: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            _id++
            resolve(_id)
          }, 500 - _id * 150)
        })
      },
    })

    expect(await store.cache.dispatch('action', { value: 1 })).toBe(1)
    expect(await store.cache.dispatch('action', { value: 2 })).toBe(2)
    expect(await store.cache.dispatch({ type: 'action' })).toBe(3)

    expect(await store.cache.dispatch('action', { value: 1 })).toBe(1)
    expect(await store.cache.dispatch('action', { value: 2 })).toBe(2)
    expect(await store.cache.dispatch({ type: 'action' })).toBe(3)
  })

  it('delete action from cache on rejection', async () => {
    const store = createStore({
      action: () => {
        throw new Error('An unknown error.')
      },
    })

    let error

    try {
      const action = store.cache.dispatch('action')
      expect(store.cache.has('action')).toBeTruthy()
      await action
    } catch (e) {
      error = e
    }

    expect(store.cache.has('action')).toBeFalsy()
    expect(error).toEqual(new Error('An unknown error.'))
  })

  it('non JSON parsable just fallback to native dispatch', async () => {
    let wasCalled = false

    const store = createStore({
      A: () => {
        wasCalled = true
      },
    })

    const a = {}
    a.b = { a }

    await store.cache.dispatch('A', a)

    expect(wasCalled).toBeTruthy()
    expect(store.cache.has('A', a)).toBeFalsy()
  })

  it('supports modules', async () => {
    let name = ''
    const store = createStoreWithModules({
      user: {
        namespaced: true,
        actions: {
          rename: (_, newName) => {
            name = newName
          },
        },
      },
    })

    expect(name).toBe('')
    expect(store.cache.has('user/rename', '@vitorluizc')).toBeFalsy()

    await store.cache.dispatch('user/rename', '@vitorluizc')

    expect(name).toBe('@vitorluizc')
    expect(store.cache.has('user/rename', '@vitorluizc')).toBeTruthy()
  })
})
