import { expectDefinedAndReturn } from '@strictly/vitest'
/* oxlint-disable typescript/no-explicit-any -- the adapters are intentionally untyped here */
import { type FieldAdapter } from 'form/core/mobx/FieldAdapter'
import { identityAdapter } from 'form/core/mobx/fieldAdapterBuilder'
import {
  type MergedOfFieldAdaptersWithTwoWayConverter,
  mergeFieldAdaptersWithTwoWayConverter,
} from 'form/core/mobx/mergeFieldAdaptersWithTwoWayConverter'
import {
  annotatedIdentityConverter,
  unreliableIdentityConverter,
} from 'form/field-converters/identityConverter'
import {
  type TwoWayFieldConverter,
  UnreliableFieldConversionType,
} from 'form/types/FieldConverters'
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

describe('MergedOfFieldAdapterWithTwoWayConverter', () => {
  type T = {
    readonly x: FieldAdapter<
      boolean,
      string,
      typeof error1,
      'x',
      typeof context
    >
    readonly y: FieldAdapter<
      number,
      boolean,
      typeof error2,
      'y',
      typeof context
    >
    readonly z: FieldAdapter<string, number, typeof error3, 'z', typeof context>
  }
  type M = MergedOfFieldAdaptersWithTwoWayConverter<
    T,
    typeof error4,
    typeof context
  >

  type C = {
    readonly x: FieldAdapter<
      boolean,
      string,
      typeof error1 | typeof error4,
      'x',
      typeof context
    >
    readonly y: FieldAdapter<
      number,
      boolean,
      typeof error2 | typeof error4,
      'y',
      typeof context
    >
    readonly z: FieldAdapter<
      string,
      number,
      typeof error3 | typeof error4,
      'z',
      typeof context
    >
  }

  it('merges the errors', () => {
    expectTypeOf<M>().toEqualTypeOf<C>()
  })
})

const originalIntegerAdapter = identityAdapter(0)
const originalBooleanAdapter = identityAdapter(false, true)
const originalConverter: TwoWayFieldConverter<
  any,
  any,
  typeof error4,
  string,
  typeof context
> = {
  convert: annotatedIdentityConverter(),
  revert: unreliableIdentityConverter(),
}

describe('mergeFieldAdaptersWithTwoWayConverter', () => {
  const integerAdapter = createMockedAdapter(originalIntegerAdapter)
  const booleanAdapter = createMockedAdapter(originalBooleanAdapter)

  beforeEach(() => {
    resetMockAdapter(originalIntegerAdapter, integerAdapter)
    resetMockAdapter(originalBooleanAdapter, booleanAdapter)
  })

  describe('two entries', () => {
    const fieldAdapters = {
      integerAdapter,
      booleanAdapter,
    }

    const converter = createMockTwoWayFieldConverter(originalConverter)

    beforeEach(() => {
      resetMockTwoWayFieldConverter(originalConverter, converter)
    })

    const merged = mergeFieldAdaptersWithTwoWayConverter(
      fieldAdapters,
      converter,
    )

    describe('convert', () => {
      let result: ReturnType<typeof merged.booleanAdapter.convert>

      describe('success', () => {
        // note don't really need to exercise this too extensively since most of
        // the work is done in chainXFieldAdapter
        beforeEach(() => {
          result = merged.booleanAdapter.convert(
            true,
            'booleanAdapter',
            context,
          )
        })

        it('returns the same value on convert', () => {
          expect(result).toEqual(
            expect.objectContaining({
              value: true,
            }),
          )
        })

        it('calls the mocked converter', () => {
          expect(converter.convert).toHaveBeenCalledOnce()
          expect(converter.convert).toHaveBeenCalledWith(
            true,
            'booleanAdapter',
            context,
          )
        })

        it('calls the mocked adapter', () => {
          expect(booleanAdapter.convert).toHaveBeenCalledOnce()
          expect(booleanAdapter.convert).toHaveBeenCalledWith(
            true,
            'booleanAdapter',
            context,
          )
        })
      })
    })

    describe('revert', () => {
      let result: ReturnType<NonNullable<typeof merged.booleanAdapter.revert>>

      describe('success', () => {
        // note don't really need to exercise this too extensively since most of
        // the work is done in chainXFieldAdapter
        beforeEach(() => {
          result = expectDefinedAndReturn(merged.booleanAdapter.revert)(
            true,
            'booleanAdapter',
            context,
          )
        })

        it('returns the same value on revert', () => {
          expect(result).toEqual(
            expect.objectContaining({
              value: true,
              type: UnreliableFieldConversionType.Success,
            }),
          )
        })

        it('calls the mocked converter', () => {
          expect(converter.revert).toHaveBeenCalledOnce()
          expect(converter.revert).toHaveBeenCalledWith(
            true,
            'booleanAdapter',
            context,
          )
        })

        it('calls the mocked adapter', () => {
          expect(booleanAdapter.revert).toHaveBeenCalledOnce()
          expect(booleanAdapter.revert).toHaveBeenCalledWith(
            true,
            'booleanAdapter',
            context,
          )
        })
      })
    })
  })
})
