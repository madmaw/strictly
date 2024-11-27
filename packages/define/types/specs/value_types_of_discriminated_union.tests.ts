import { type SimplifyDeep } from 'type-fest'
import {
  boolean,
  number,
  struct,
  union,
} from 'types/builders'
import { type ValueTypesOfDiscriminatedUnion } from 'types/value_types_of_discriminated_union'

describe('ValueTypesOfDiscriminatedUnion', function () {
  it('matches expected type', function () {
    const { typeDef } = union('d')
      .add('a', struct().set('x', number))
      .add('b', struct().set('y', boolean))
    type T = SimplifyDeep<ValueTypesOfDiscriminatedUnion<
      typeof typeDef
    >>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly a: {
        d: 'a',
        x: number,
      },
      readonly b: {
        d: 'b',
        y: boolean,
      },
    }>()
  })
})
