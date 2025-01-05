import { expectEquals } from '@strictly/base'
import { type Validator } from '@strictly/define'
import { type FieldAdapter } from 'core/mobx/field_adapter'
import {
  identityAdapter,
} from 'core/mobx/field_adapter_builder'
import {
  mergeAdaptersWithValidators,
  type MergedOfFieldAdaptersWithValidators,
} from 'core/mobx/merge_field_adapters_with_validators'
import { FieldConversionResult } from 'types/field_converters'
import { mockClear } from 'vitest-mock-extended'
import { createMockedAdapter } from './fixtures'

const error1 = 'error 1'
const error2 = 'error 2'
const context = 'context 1'

describe('MergedOfFieldAdaptersWithValidators', function () {
  describe('empty validators', function () {
    type Adapters = {
      readonly a: FieldAdapter<number, string, typeof error1, 'a', typeof context>,
    }
    type Validators = {}

    type Merged = MergedOfFieldAdaptersWithValidators<Adapters, Validators>

    it('does not change the adapters', function () {
      expectTypeOf<Merged>().toEqualTypeOf<Adapters>()
    })
  })

  describe('different errors', function () {
    type Adapters = {
      readonly a: FieldAdapter<number, string, typeof error1, 'a', typeof context>,
    }
    type Validators = {
      readonly a: Validator<number, typeof error2, 'a', typeof context>,
    }

    type Merged = MergedOfFieldAdaptersWithValidators<Adapters, Validators>

    it('merges the error types', function () {
      expectTypeOf<Merged>().toEqualTypeOf<{
        readonly a: FieldAdapter<number, string, typeof error1 | typeof error2, 'a', typeof context>,
      }>()
    })
  })

  describe('different x', function () {
    type Adapters = {
      readonly a: FieldAdapter<number, string, typeof error1, string, typeof context>,
    }
    type Validators = {
      readonly a: Validator<number, typeof error2, 'a', typeof context>,
    }

    type Merged = MergedOfFieldAdaptersWithValidators<Adapters, Validators>

    it('merges the error types', function () {
      expectTypeOf<Merged>().toEqualTypeOf<{
        readonly a: FieldAdapter<number, string, typeof error1 | typeof error2, string, typeof context>,
      }>()
    })
  })

  describe('different values', function () {
    type Adapters = {
      readonly a: FieldAdapter<number, string, typeof error1, 'a', typeof context>,
    }
    type Validators = {
      readonly a: Validator<boolean, typeof error2, 'a', typeof context>,
    }

    type Merged = MergedOfFieldAdaptersWithValidators<Adapters, Validators>

    it('removes mismatched values', function () {
      expectTypeOf<Merged>().toEqualTypeOf<{
        readonly a: never,
      }>()
    })
  })
})

describe('mergeFieldAdaptersWithValidators', function () {
  const integerToIntegerAdapter = createMockedAdapter(
    identityAdapter(0),
  )
  const booleanToBooleanAdapter = createMockedAdapter(
    identityAdapter(false),
  )

  const failingValidator1 = vi.fn<Validator>(function () {
    return 'fail 1'
  })

  const failingValidator2 = vi.fn<Validator>(function () {
    return 'fail 2'
  })

  beforeEach(function () {
    mockClear(integerToIntegerAdapter)
    mockClear(booleanToBooleanAdapter)
    mockClear(failingValidator1)
    mockClear(failingValidator2)
  })

  describe('record contents', function () {
    describe('empty validators', function () {
      const adapters = {
        a: integerToIntegerAdapter,
        b: booleanToBooleanAdapter,
      } as const
      const validators = {} as const

      const merged = mergeAdaptersWithValidators(adapters, validators)
      it('does not change the adapters', function () {
        expect(merged).toEqual(adapters)
      })
    })

    const adapters = {
      a: integerToIntegerAdapter,
      b: booleanToBooleanAdapter,
    } as const
    const validators = {
      a: failingValidator1,
      b: failingValidator2,
    } as const

    const merged = mergeAdaptersWithValidators(adapters, validators)

    describe('matching validators', function () {
      it('has the same keys', function () {
        expect([...Object.keys(adapters)]).toEqual([
          'a',
          'b',
        ])
      })

      it.each([
        'a',
        'b',
      ] as const)('does not modify the create or convert methods for field %s', function (key) {
        const adapter = adapters[key]
        const mergedAdapter = merged[key]

        expect(adapter.convert).toEqual(mergedAdapter.convert)
        expect(adapter.create).toEqual(mergedAdapter.create)
        expect(adapter.revert).not.toEqual(mergedAdapter.revert)
      })
    })

    describe('validation result change', function () {
      it.each([
        [
          'a',
          'fail 1',
          true,
        ],
        [
          'b',
          'fail 2',
          1,
        ],
      ] as const)('field %s fails with validation %s', function (key, error, value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adapter: FieldAdapter<any, any, string, any> = adapters[key]
        const originalResult = adapter.revert?.(value, key, null)
        expect(originalResult?.type).toEqual(FieldConversionResult.Success)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mergedAdapter: FieldAdapter<any, any, string, any> = merged[key]
        const result = mergedAdapter.revert?.(value, key, null)
        expectEquals(result?.type, FieldConversionResult.Failure)
        expect(result.error).toEqual(error)
      })
    })
  })
})
