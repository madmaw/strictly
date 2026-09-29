import { type Reverse } from '@strictly/base'
import { list, numberType, object, stringType } from 'types/builders'
import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type FlattenedValidatorsOfValidatingType } from 'types/FlattenedValidatorsOfValidatingType'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'
import { type Validator } from 'validation/validator'

describe('FlattenedValidatorsOfValidatingType', () => {
  describe('literal', () => {
    const literalType = numberType.enforce<'a', number>((): 'a' => 'a').narrow
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
    ).narrow
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

  describe('object', () => {
    const objectType = object()
      .field(
        'a',
        numberType.enforce<'A'>((): 'A' => 'A'),
      )
      .field('b', stringType)
      .optionalField(
        'c',
        stringType.enforce<'C'>((): 'C' => 'C'),
      ).narrow
    type T = FlattenedValidatorsOfValidatingType<
      typeof objectType,
      Reverse<ValueToTypePathsOfType<typeof objectType>>
    >

    it('only keeps the paths with rules', () => {
      expectTypeOf<keyof T>().toEqualTypeOf<'$.a' | '$.c'>()
    })

    it('validates the value at the path', () => {
      expectTypeOf<T['$.a']>().toEqualTypeOf<
        Validator<number, 'A', '$.a', {}>
      >()
      expectTypeOf<T['$.c']>().toEqualTypeOf<
        Validator<string | undefined, 'C', '$.c', {}>
      >()
    })

    it('includes the global context', () => {
      type G = FlattenedValidatorsOfValidatingType<
        typeof objectType,
        Reverse<ValueToTypePathsOfType<typeof objectType>>,
        FlattenedTypesOfType<typeof objectType, '*'>,
        { readonly g: boolean }
      >
      expectTypeOf<G['$.a']>().toEqualTypeOf<
        Validator<number, 'A', '$.a', { readonly g: boolean }>
      >()
    })
  })
})
