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
    const literalType = numberType.enforce(function (): 'a' {
      return 'a'
    })
    type T = FlattenedValidatorsOfValidatingType<
      typeof literalType,
      Reverse<ValueToTypePathsOfType<typeof literalType>>
    >

    let t: {
      readonly $: Validator<number, 'a', '$', number>,
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf(t)
    })
  })

  describe('list', function () {
    const literalType = numberType.enforce(function (): 'x' {
      return 'x'
    })
    const listType = list(literalType.narrow).enforce(function (): 'y' {
      return 'y'
    })
    type T = FlattenedValidatorsOfValidatingType<typeof listType, Reverse<ValueToTypePathsOfType<typeof listType>>>

    let t: {
      readonly $: Validator<readonly number[], 'y', '$', readonly number[]>,
      readonly '$.*': Validator<number, 'x', `$.${number}`, readonly number[]>,
    }

    it('equals expected type', function () {
      expectTypeOf<T>().toEqualTypeOf(t)
    })
  })
})
