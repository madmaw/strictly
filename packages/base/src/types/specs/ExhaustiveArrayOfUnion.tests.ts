import { type ExhaustiveArrayOfUnion } from 'types/ExhaustiveArrayOfUnion'

describe('ExhaustiveArrayOfUnion', () => {
  it('allows matching array', () => {
    type X = 'a' | 'b' | 'c'
    const a = ['a', 'b', 'c'] as const
    type T = ExhaustiveArrayOfUnion<X, typeof a>
    expectTypeOf<T>().toEqualTypeOf(a)
  })

  it('disallows subset array', () => {
    type X = 'a' | 'b' | 'c'
    const a = ['a', 'b'] as const
    type T = ExhaustiveArrayOfUnion<X, typeof a>
    expectTypeOf<T>().not.toEqualTypeOf(a)
  })

  it('disallows superset array', () => {
    type X = 'a' | 'b'
    const a = ['a', 'b', 'c'] as const
    // oxlint-disable-next-line typescript/ban-ts-comment -- asserts the superset is a compile error
    // @ts-expect-error 'c' is not a member of X
    expectTypeOf<ExhaustiveArrayOfUnion<X, typeof a>>().toEqualTypeOf(a)
  })
})
