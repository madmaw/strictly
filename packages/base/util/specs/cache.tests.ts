import {
  Cache,
  type CacheValueFactory,
} from 'util/cache'
import {
  type Mock,
  vi,
} from 'vitest'

describe('cache', function () {
  type Args = [string, number, boolean]
  let cache: Cache<Args, boolean>
  let valueFactory: Mock<CacheValueFactory<Args, boolean>>

  beforeEach(function () {
    valueFactory = vi.fn()
    valueFactory.mockReturnValue(true)
    cache = new Cache(
      valueFactory,
    )
  })

  describe('creates value that does not exist', function () {
    let value: boolean
    const params: Args = [
      'a',
      1,
      false,
    ]
    beforeEach(function () {
      value = cache.retrieveOrCreate(...params)
    })

    it('calls the value factory with the transformed key', function () {
      expect(valueFactory).toHaveBeenCalledOnce()
      expect(valueFactory).toHaveBeenCalledWith(...params)
    })

    it('returns the expected value', function () {
      expect(value).toBeTruthy()
    })

    describe('retrieveByKey', function () {
      it('retrieves value by key', function () {
        expect(cache.retrieve(...params)).toEqual([true])
      })

      it('returns nothing when a non-existent key is supplied', function () {
        expect(cache.retrieve('a', 1, true)).toBeNull()
      })
    })

    describe('looking up previously created value', function () {
      let cachedValue: boolean
      beforeEach(function () {
        cachedValue = cache.retrieveOrCreate(...params)
      })

      it('does not create the value again', function () {
        expect(valueFactory).toHaveBeenCalledOnce()
      })

      it('returns the expected value', function () {
        expect(cachedValue).toBeTruthy()
      })
    })
  })
})
