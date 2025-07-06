import { type ExhaustiveArrayOfUnion } from 'types/ExhaustiveArrayOfUnion'

describe('ExhaustiveArrayOfUnion', function () {
  it('allows matching array', function () {
    type X = 'a' | 'b' | 'c'
    const a = [
      'a',
      'b',
      'c',
    ] as const
    type T = ExhaustiveArrayOfUnion<X, typeof a>
    expectTypeOf<T>().toEqualTypeOf(a)
  })

  it('disallows subset array', function () {
    type X = 'a' | 'b' | 'c'
    const a = [
      'a',
      'b',
    ] as const
    type T = ExhaustiveArrayOfUnion<X, typeof a>
    expectTypeOf<T>().not.toEqualTypeOf(a)
  })

  /*
  it('disallows superset array', function () {
    type X = 'a' | 'b'
    const a = [
      'a',
      'b',
      'c',
    ] as const
    // does not compile
    type T = ExhaustiveArrayOfUnion<X, typeof a>
    expectTypeOf<T>().not.toEqualTypeOf(a)
  })
  */
})
