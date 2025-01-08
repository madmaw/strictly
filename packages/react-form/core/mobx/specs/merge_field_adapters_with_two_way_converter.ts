import { type FieldAdapter } from 'core/mobx/field_adapter'
import { identityAdapter } from 'core/mobx/field_adapter_builder'
import {
  type MergedOfFieldAdaptersWithTwoWayConverter,
  mergeFieldAdaptersWithTwoWayConverter,
} from 'core/mobx/merge_field_adapters_with_two_way_converter'
import {
  annotatedIdentityConverter,
  unreliableIdentityConverter,
} from 'field_converters/identity_converter'
import {
  type TwoWayFieldConverter,
  UnreliableFieldConversionType,
} from 'types/field_converters'
import {
  createMockedAdapter,
  createMockTwoWayFieldConverter,
  resetMockAdapter,
  resetMockTwoWayFieldConverter,
} from './fixtures'

const error1 = Symbol()
const error2 = Symbol()
const error3 = Symbol()
const error4 = Symbol()
const context = Symbol()

describe('MergedOfFieldAdapterWithTwoWayConverter', function () {
  type T = {
    readonly x: FieldAdapter<boolean, string, typeof error1, 'x', typeof context>,
    readonly y: FieldAdapter<number, boolean, typeof error2, 'y', typeof context>,
    readonly z: FieldAdapter<string, number, typeof error3, 'z', typeof context>,
  }
  type M = MergedOfFieldAdaptersWithTwoWayConverter<T, typeof error4, typeof context>

  let m: {
    readonly x: FieldAdapter<boolean, string, typeof error1 | typeof error4, 'x', typeof context>,
    readonly y: FieldAdapter<number, boolean, typeof error2 | typeof error4, 'y', typeof context>,
    readonly z: FieldAdapter<string, number, typeof error3 | typeof error4, 'z', typeof context>,
  }

  it('merges the errors', function () {
    expectTypeOf<M>().toEqualTypeOf(m)
  })
})

const originalIntegerAdapter = identityAdapter(0)
const originalBooleanAdapter = identityAdapter(false, true)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalConverter: TwoWayFieldConverter<any, any, typeof error4, string, typeof context> = {
  convert: annotatedIdentityConverter(),
  revert: unreliableIdentityConverter(),
}

describe('mergeFieldAdaptersWithTwoWayConverter', function () {
  const integerAdapter = createMockedAdapter(
    originalIntegerAdapter,
  )
  const booleanAdapter = createMockedAdapter(
    originalBooleanAdapter,
  )

  beforeEach(function () {
    resetMockAdapter(originalIntegerAdapter, integerAdapter)
    resetMockAdapter(originalBooleanAdapter, booleanAdapter)
  })

  describe('two entries', function () {
    const fieldAdapters = {
      integerAdapter,
      booleanAdapter,
    }

    const converter = createMockTwoWayFieldConverter(originalConverter)

    beforeEach(function () {
      resetMockTwoWayFieldConverter(originalConverter, converter)
    })

    const merged = mergeFieldAdaptersWithTwoWayConverter(fieldAdapters, converter)

    describe('convert', function () {
      let result: ReturnType<typeof merged.booleanAdapter.convert>

      describe('success', function () {
        // note don't really need to exercise this too extensively since most of
        // the work is done in chainXFieldAdapter
        beforeEach(function () {
          result = merged.booleanAdapter.convert(true, 'booleanAdapter', context)
        })

        it('returns the same value on convert', function () {
          expect(result).toEqual(expect.objectContaining({
            value: true,
          }))
        })

        it('calls the mocked converter', function () {
          expect(converter.convert).toHaveBeenCalledOnce()
          expect(converter.convert).toHaveBeenCalledWith(true, 'booleanAdapter', context)
        })

        it('calls the mocked adapter', function () {
          expect(booleanAdapter.convert).toHaveBeenCalledOnce()
          expect(booleanAdapter.convert).toHaveBeenCalledWith(true, 'booleanAdapter', context)
        })
      })
    })

    describe('revert', function () {
      let result: ReturnType<NonNullable<typeof merged.booleanAdapter.revert>>

      describe('success', function () {
        // note don't really need to exercise this too extensively since most of
        // the work is done in chainXFieldAdapter
        beforeEach(function () {
          result = merged.booleanAdapter.revert!(true, 'booleanAdapter', context)
        })
      })

      it('returns the same value on revert', function () {
        expect(result).toEqual(expect.objectContaining({
          value: true,
          type: UnreliableFieldConversionType.Success,
        }))
      })

      it('calls the mocked converter', function () {
        expect(converter.revert).toHaveBeenCalledOnce()
        expect(converter.revert).toHaveBeenCalledWith(true, 'booleanAdapter', context)
      })

      it('calls the mocked adapter', function () {
        expect(booleanAdapter.revert).toHaveBeenCalledOnce()
        expect(booleanAdapter.revert).toHaveBeenCalledWith(true, 'booleanAdapter', context)
      })
    })
  })
})
