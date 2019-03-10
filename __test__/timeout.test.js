import Vue from 'vue'
import Vuex from 'vuex'
import { createStore, sleep, createStoreWithTimeout } from './helpers'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  createStore().cache.clear()
})

describe('timeout option', () => {
  it('timeout can be defined on payload', async () => {
    let wasCalledTimes = 0

    const store = createStore({
      A: () => void wasCalledTimes++,
    })

    await store.cache.dispatch({
      type: 'A',
      timeout: 100,
    })

    expect(wasCalledTimes).toBe(1)

    await sleep(50)

    await store.cache.dispatch({
      type: 'A',
      timeout: 100,
    })

    expect(wasCalledTimes).toBe(1)

    await sleep(50) // 50 + 50 = 100

    await store.cache.dispatch({
      type: 'A',
      timeout: 100,
    })

    expect(wasCalledTimes).toBe(2)
  })

  it('timeout can be defined on options (3rd argument)', async () => {
    let wasCalledTimes = 0

    const store = createStore({
      A: () => void wasCalledTimes++,
    })

    await store.cache.dispatch('A', undefined, {
      timeout: 100,
    })

    expect(wasCalledTimes).toBe(1)

    await sleep(50)

    await store.cache.dispatch('A', undefined, {
      timeout: 100,
    })

    expect(wasCalledTimes).toBe(1)

    await sleep(50) // 50 + 50 = 100

    await store.cache.dispatch('A', undefined, {
      timeout: 100,
    })

    expect(wasCalledTimes).toBe(2)
  })

  it('timeout can be defined on store options', async () => {
    let wasCalledTimes = 0

    const store = createStoreWithTimeout(100, {
      A: () => void wasCalledTimes++,
    })

    await store.cache.dispatch('A')

    expect(wasCalledTimes).toBe(1)

    await sleep(50)

    await store.cache.dispatch('A')

    expect(wasCalledTimes).toBe(1)

    await sleep(50) // 50 + 50 = 100

    await store.cache.dispatch('A')

    expect(wasCalledTimes).toBe(2)
  })

  it('overwrite default timeout option on each dispatch', async () => {
    let wasCalledTimes = 0

    const store = createStoreWithTimeout(100, {
      A: () => void wasCalledTimes++,
    })

    await store.cache.dispatch('A', undefined, {
      timeout: 200,
    })

    await sleep(100)

    expect(wasCalledTimes).toBe(1)

    await store.cache.dispatch('A', undefined, {
      timeout: 200,
    })

    expect(wasCalledTimes).toBe(1)

    await sleep(100) // 100 + 100 = 200

    await store.cache.dispatch('A', undefined, {
      timeout: 200,
    })

    expect(wasCalledTimes).toBe(2)
  })
})
