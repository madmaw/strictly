import { type StringKeyOf } from 'types/StringKeyOf'

const s = Symbol()
type S = typeof s

describe('PrintableOf', () => {
  it('filters out the non-string keys', () => {
    type T = StringKeyOf<Record<string | number | symbol, unknown>>
    expectTypeOf<T>().toEqualTypeOf<string>()
  })

  it('filters out the non-string literal keys', () => {
    type T = StringKeyOf<Record<'a' | 'b' | 1 | 2 | S, unknown>>
    expectTypeOf<T>().toEqualTypeOf<'a' | 'b'>()
  })
})
