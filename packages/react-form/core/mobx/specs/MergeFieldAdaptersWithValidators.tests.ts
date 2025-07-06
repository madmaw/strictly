import {
  expectDefined,
  expectEquals,
} from '@strictly/base'
import {
  type AnnotatedValidator,
  type FunctionalValidator,
  type Validator,
} from '@strictly/define'
import { type FieldAdapter } from 'core/mobx/FieldAdapter'
import {
  identityAdapter,
} from 'core/mobx/fieldAdapterBuilder'
import {
  mergeAdaptersWithValidators,
  type MergedOfFieldAdaptersWithValidators,
} from 'core/mobx/mergeFieldAdaptersWithValidators'
import { UnreliableFieldConversionType } from 'types/FieldConverters'
import {
  createMockedAdapter,
  resetMockAdapter,
} from './fixtures'

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

  describe('different paths', function () {
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

const originalIntegerToIntegerAdapter = identityAdapter(0)
const originalBooleanToBooleanAdapter = identityAdapter(false, true)

describe('mergeFieldAdaptersWithValidators', function () {
  const integerToIntegerAdapter = createMockedAdapter(
    originalIntegerToIntegerAdapter,
  )
  const booleanToBooleanAdapter = createMockedAdapter(
    originalBooleanToBooleanAdapter,
  )

  const failingValidator1 = vi.fn<FunctionalValidator>(function () {
    return 'fail 1'
  })

  const failingValidator2 = vi.fn<FunctionalValidator>(function () {
    return 'fail 2'
  })

  const requiredValidator: AnnotatedValidator = {
    validate: () => null,
    annotations: () => ({
      required: true,
      readonly: false,
    }),
  }

  const readonlyValidator: AnnotatedValidator = {
    validate: () => null,
    annotations: () => ({
      required: false,
      readonly: true,
    }),
  }

  beforeEach(function () {
    resetMockAdapter(originalIntegerToIntegerAdapter, integerToIntegerAdapter)
    resetMockAdapter(originalBooleanToBooleanAdapter, booleanToBooleanAdapter)
    failingValidator1.mockClear()
    failingValidator2.mockClear()
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

    describe('populated validators', function () {
      const adapters = {
        a: integerToIntegerAdapter,
        b: booleanToBooleanAdapter,
        c: integerToIntegerAdapter,
        d: integerToIntegerAdapter,
      } as const
      const validators = {
        a: failingValidator1,
        b: failingValidator2,
        c: requiredValidator,
        d: readonlyValidator,
      } as const

      const merged = mergeAdaptersWithValidators(adapters, validators)

      describe('matching validators', function () {
        it('has the same keys', function () {
          expect([...Object.keys(adapters)]).toEqual([
            'a',
            'b',
            'c',
            'd',
          ])
        })
      })

      describe('revert', function () {
        it.each([
          [
            'a',
            'fail 1',
            1,
          ],
          [
            'b',
            'fail 2',
            true,
          ],
        ] as const)('field %s fails with validation %s', function (key, error, value) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mergedAdapter: FieldAdapter<any, any, string, any> = merged[key]
          expectDefined(mergedAdapter.revert)
          const result = mergedAdapter.revert(value, key, null)
          expectEquals(result.type, UnreliableFieldConversionType.Failure)
          expect(result.error).toEqual(error)
        })

        it.each([
          [
            'c',
            1,
          ],
          [
            'd',
            true,
          ],
        ] as const)('field %s succeeds with value %s', function (key, value) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mergedAdapter: FieldAdapter<any, any, string, any> = merged[key]
          expectDefined(mergedAdapter.revert)
          const result = mergedAdapter.revert(value, key, null)
          expectEquals(result.type, UnreliableFieldConversionType.Success)
          expect(result.value).toEqual(value)
        })
      })

      describe('convert', function () {
        it.each([
          [
            'a',
            false,
            false,
            1,
          ],
          [
            'b',
            true,
            false,
            true,
          ],
          [
            'c',
            true,
            false,
            2,
          ],
          [
            'd',
            false,
            true,
            3,
          ],
        ] as const)(
          'field %s is required %s and readonly %s',
          function (key, expectedRequired, expectedReadonly, value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const adapter: FieldAdapter<any, any, string, any> = merged[key]
            const {
              required,
              readonly,
            } = adapter.convert(value, key, null)
            expect(required).toEqual(expectedRequired)
            expect(readonly).toEqual(expectedReadonly)
          },
        )
      })
    })
  })
})
