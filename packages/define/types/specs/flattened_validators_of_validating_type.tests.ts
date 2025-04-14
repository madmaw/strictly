import { type Reverse } from '@strictly/base'
import {
  list,
  numberType,
} from 'types/builders'
import { type FlattenedValidatorsOfValidatingType } from 'types/flattened_validators_of_validating_type'
import { type ValueToTypePathsOfType } from 'types/value_to_type_paths_of_type'
import { type Validator } from 'validation/validator'

describe('FlattenedValidatorsOfValidatingType', function () {
  describe('literal', function () {
    const literalType = numberType.enforce<'a', number>(function (): 'a' {
      return 'a'
    })
    type T = FlattenedValidatorsOfValidatingType<
      typeof literalType,
      Reverse<ValueToTypePathsOfType<typeof literalType>>
    >

    type C = {
      readonly $: Validator<number, 'a', '$', number>,
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('list', function () {
    const literalType = numberType.enforce<'Y', { b: boolean }>(function (): 'Y' {
      return 'Y'
    })
    const listType = list(literalType.narrow).enforce<'X', { a: number }>(function (): 'X' {
      return 'X'
    })
    type T = FlattenedValidatorsOfValidatingType<typeof listType, Reverse<ValueToTypePathsOfType<typeof listType>>>

    type C = {
      readonly $: Validator<readonly number[], 'X', '$', { a: number }>,
      readonly '$.*': Validator<number, 'Y', `$.${number}`, { b: boolean }>,
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })
})
