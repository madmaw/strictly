import { type SimplifyDeep } from 'type-fest'
import {
  booleanType,
  numberType,
  object,
  union,
} from 'types/builders'
import { type ValueTypesOfDiscriminatedUnion } from 'types/value_types_of_discriminated_union'

describe('ValueTypesOfDiscriminatedUnion', function () {
  it('matches expected type', function () {
    const { definition } = union('d')
      .or('a', object().field('x', numberType))
      .or('b', object().field('y', booleanType))
    type T = SimplifyDeep<ValueTypesOfDiscriminatedUnion<
      typeof definition
    >>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly a: {
        readonly d: 'a',
        readonly x: number,
      },
      readonly b: {
        readonly d: 'b',
        readonly y: boolean,
      },
    }>()
  })
})
