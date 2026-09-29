import { Cache, type CacheValueFactory } from 'util/Cache'
import { type Mock, vi } from 'vite-plus/test'

describe('cache', () => {
  type Args = [string, number, boolean]
  let cache: Cache<Args, boolean>
  let valueFactory: Mock<CacheValueFactory<Args, boolean>>

  beforeEach(() => {
    valueFactory = vi.fn()
    valueFactory.mockReturnValue(true)
    cache = new Cache(valueFactory)
  })

  describe('creates value that does not exist', () => {
    let value: boolean
    const params: Args = ['a', 1, false]
    beforeEach(() => {
      value = cache.retrieveOrCreate(...params)
    })

    it('calls the value factory with the transformed key', () => {
      expect(valueFactory).toHaveBeenCalledOnce()
      expect(valueFactory).toHaveBeenCalledWith(...params)
    })

    it('returns the expected value', () => {
      expect(value).toBeTruthy()
    })

    describe('retrieveByKey', () => {
      it('retrieves value by key', () => {
        expect(cache.retrieve(...params)).toEqual([true])
      })

      it('returns nothing when a non-existent key is supplied', () => {
        expect(cache.retrieve('a', 1, true)).toBeNull()
      })
    })

    describe('looking up previously created value', () => {
      let cachedValue: boolean
      beforeEach(() => {
        cachedValue = cache.retrieveOrCreate(...params)
      })

      it('does not create the value again', () => {
        expect(valueFactory).toHaveBeenCalledOnce()
      })

      it('returns the expected value', () => {
        expect(cachedValue).toBeTruthy()
      })
    })
  })
})
