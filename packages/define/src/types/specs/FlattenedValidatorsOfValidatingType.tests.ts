import { type Reverse } from '@strictly/base'
import { list, numberType } from 'types/builders'
import { type FlattenedValidatorsOfValidatingType } from 'types/FlattenedValidatorsOfValidatingType'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'
import { type Validator } from 'validation/validator'

describe('FlattenedValidatorsOfValidatingType', () => {
  describe('literal', () => {
    const literalType = numberType.enforce<'a', number>((): 'a' => 'a')
    type T = FlattenedValidatorsOfValidatingType<
      typeof literalType,
      Reverse<ValueToTypePathsOfType<typeof literalType>>
    >

    type C = {
      readonly $: Validator<number, 'a', '$', number>
    }

    it('equals expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })

  describe('list', () => {
    const literalType = numberType.enforce<'Y', { b: boolean }>((): 'Y' => 'Y')
    const listType = list(literalType.narrow).enforce<'X', { a: number }>(
      (): 'X' => 'X',
    )
    type T = FlattenedValidatorsOfValidatingType<
      typeof listType,
      Reverse<ValueToTypePathsOfType<typeof listType>>
    >

    type C = {
      readonly $: Validator<readonly number[], 'X', '$', { a: number }>
      readonly '$.*': Validator<number, 'Y', `$.${number}`, { b: boolean }>
    }

    it('equals expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<C>()
    })
  })
})
