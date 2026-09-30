import { booleanType, numberType, object, union } from 'define/types/builders'
import { type ValueTypesOfDiscriminatedUnion } from 'define/types/ValueTypesOfDiscriminatedUnion'

describe('ValueTypesOfDiscriminatedUnion', () => {
  it('matches expected type', () => {
    const t = union('d')
      .or('a', object().field('x', numberType))
      .or('b', object().field('y', booleanType)).narrow
    type T = ValueTypesOfDiscriminatedUnion<typeof t>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly a: {
        readonly d: 'a'
        readonly x: number
      }
      readonly b: {
        readonly d: 'b'
        readonly y: boolean
      }
    }>()
  })

  it('is never for a union without a discriminator', () => {
    const t = union().or('a', numberType).or('b', booleanType).narrow
    expectTypeOf<
      ValueTypesOfDiscriminatedUnion<typeof t>
    >().toEqualTypeOf<never>()
  })
})
