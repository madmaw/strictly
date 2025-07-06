import {
  type AnnotatedValidator,
  annotations,
  type FunctionalValidator,
  validate,
  type Validator,
} from '@strictly/define'
import {
  type MergedOfValidators,
  mergeValidators,
} from 'types/mergeValidators'
import {
  type Mock,
  type Mocked,
} from 'vitest'
import {
  mock,
  mockReset,
} from 'vitest-mock-extended'

describe('MergedOfValidators', function () {
  describe('empty validators 1', function () {
    type Validators1 = {
      readonly a: Validator<string, 'error a', 'a', null>,
      readonly b: Validator<number, 'error b', 'b', null>,
    }
    type Validators2 = {}

    type Validators = MergedOfValidators<Validators1, Validators2>

    it('equals the expected type', function () {
      expectTypeOf<Validators>().toEqualTypeOf<Validators1>()
    })
  })

  describe('empty validators 2', function () {
    type Validators1 = {}
    type Validators2 = {
      readonly a: Validator<string, 'error a', 'a', null>,
      readonly b: Validator<number, 'error b', 'b', null>,
    }

    type Validators = MergedOfValidators<Validators1, Validators2>

    it('equals the expected type', function () {
      expectTypeOf<Validators>().toEqualTypeOf<Validators2>()
    })
  })

  describe('merged validators with different keys', function () {
    type Validators1 = {
      a: Validator<string, 'error a', 'a', null>,
    }
    type Validators2 = {
      b: Validator<number, 'error b', 'b', null>,
    }

    type Validators = MergedOfValidators<Validators1, Validators2>

    it('equals the expected type', function () {
      expectTypeOf<Validators>().toEqualTypeOf<{
        readonly a: Validator<string, 'error a', 'a', null>,
        readonly b: Validator<number, 'error b', 'b', null>,
      }>()
    })
  })

  describe('merged validators with same key', function () {
    type Validators1 = {
      a: Validator<string, 'error a', 'a', null>,
    }
    type Validators2 = {
      a: Validator<string, 'error b', 'a', null>,
    }

    type Validators = MergedOfValidators<Validators1, Validators2>

    it('equals the expected type', function () {
      expectTypeOf<Validators>().toEqualTypeOf<{
        readonly a: Validator<string, 'error a' | 'error b', 'a', null>,
      }>()
    })
  })
})

describe('mergeValidators', function () {
  describe('functional validators', function () {
    const validatorA1: Mock<FunctionalValidator<string, 'error a1', 'a', null>> = vi.fn()
    const validatorA2: Mock<FunctionalValidator<string, 'error a2', 'a', null>> = vi.fn()
    const validatorB: Mock<FunctionalValidator<boolean, 'error b', 'b', null>> = vi.fn()
    describe('produces expected type', function () {
      describe('empty validators 1', function () {
        const validators1 = {
          a: validatorA1,
          b: validatorB,
        } as const
        const validators2 = {} as const
        const validators = mergeValidators(validators1, validators2)
        it('equals expected value', function () {
          expect(validators).toEqual(validators1)
        })
      })

      describe('empty validators 2', function () {
        const validators1 = {} as const
        const validators2 = {
          a: validatorA1,
          b: validatorB,
        } as const
        const validators = mergeValidators(validators1, validators2)
        it('equals expected value', function () {
          expect(validators).toEqual(validators2)
        })
      })

      describe('merged validators with different keys', function () {
        const validators1 = {
          a: validatorA1,
        } as const
        const validators2 = {
          b: validatorB,
        } as const
        const validators = mergeValidators(validators1, validators2)
        it('equals expected value', function () {
          expect(validators).toEqual({
            a: validatorA1,
            b: validatorB,
          })
        })
      })

      describe('merged validators with same key', function () {
        const validators1 = {
          a: validatorA1,
        } as const
        const validators2 = {
          a: validatorA2,
        } as const
        const validators = mergeValidators(validators1, validators2)
        it('has the expected keys', function () {
          expect(Array.from(Object.keys(validators))).toEqual(['a'])
        })

        it('reports no error when validators report no error', function () {
          const result = validate(validators.a, 'x', 'a', null)
          expect(result).toBeUndefined()
        })

        it('reports an error from first validator', function () {
          validatorA1.mockReturnValueOnce('error a1')

          const result = validate(validators.a, 'x', 'a', null)
          expect(result).toEqual('error a1')
        })

        it('reports an error from second validator', function () {
          validatorA2.mockReturnValueOnce('error a2')

          const result = validate(validators.a, 'x', 'a', null)
          expect(result).toEqual('error a2')
        })
      })
    })
  })

  describe('annotated validators', function () {
    const validatorA1: Mocked<AnnotatedValidator<string, 'error a1', 'a', null>> = mock()
    const validatorA2: Mocked<AnnotatedValidator<string, 'error a2', 'a', null>> = mock()

    beforeEach(function () {
      mockReset(validatorA1)
      mockReset(validatorA2)
    })

    const validators1 = {
      a: validatorA1,
    } as const
    const validators2 = {
      a: validatorA2,
    } as const
    const validators = mergeValidators(validators1, validators2)

    describe.each([
      [
        false,
        false,
        false,
      ],
      [
        false,
        true,
        true,
      ],
      [
        true,
        false,
        true,
      ],
      [
        true,
        true,
        true,
      ],
    ] as const)('required', function (required1, required2, required) {
      beforeEach(function () {
        validatorA1.validate.mockReturnValue('error a1')
        validatorA1.annotations.mockReturnValue({
          required: required1,
          readonly: false,
        })
        validatorA2.annotations.mockReturnValue({
          required: required2,
          readonly: false,
        })
      })

      it('has the expected required value', function () {
        expect(annotations(validators.a, 'a', null)).toEqual({
          required,
          readonly: false,
        })
      })
    })

    describe.each([
      [
        false,
        false,
        false,
      ],
      [
        false,
        true,
        true,
      ],
      [
        true,
        false,
        true,
      ],
      [
        true,
        true,
        true,
      ],
    ] as const)('required', function (readonly1, readonly2, readonly) {
      beforeEach(function () {
        validatorA1.validate.mockReturnValue('error a1')
        validatorA1.annotations.mockReturnValue({
          required: false,
          readonly: readonly1,
        })
        validatorA2.annotations.mockReturnValue({
          required: false,
          readonly: readonly2,
        })
      })

      it('has the expected required value', function () {
        expect(annotations(validators.a, 'a', null)).toEqual({
          required: false,
          readonly,
        })
      })
    })
  })
})
