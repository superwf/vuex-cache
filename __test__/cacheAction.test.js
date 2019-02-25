import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import createCache, { cacheAction } from '../src'

beforeAll(() => {
  Vue.use(Vuex)
})

beforeEach(() => {
  new Store({
    plugins: [createCache()],
  }).cache.clear()
})

describe('cacheAction', () => {
  it('is a function to enhance action handlers', () => {
    expect(typeof cacheAction).toBe('function')

    const context = {}

    let wasCalled = 0

    cacheAction(() => {
      wasCalled++
    })(context)

    expect(wasCalled).toBe(1)

    expect(context).toHaveProperty('cache')
    expect(typeof context.cache.has).toBe('function')
    expect(typeof context.cache.clear).toBe('function')
    expect(typeof context.cache.delete).toBe('function')
    expect(typeof context.cache.dispatch).toBe('function')
  })

  it('cacheAction uses same cache scope as store', async () => {
    let wasACalled = 0
    let wasBCalled = 0

    const store = new Store({
      plugins: [createCache()],
      actions: {
        A: () => void wasACalled++,
        B: cacheAction(({ cache }) => {
          wasBCalled++
          cache.dispatch('A')
        }),
      },
    })

    expect(wasACalled).toBe(0)
    expect(wasBCalled).toBe(0)

    await store.cache.dispatch('A')

    expect(wasACalled).toBe(1)
    expect(wasBCalled).toBe(0)

    await store.cache.dispatch('B')

    expect(wasACalled).toBe(1)
    expect(wasBCalled).toBe(1)
  })
})
