import { type RequiredOfRecord } from 'types/RequiredOfRecord'

describe('RequiredOfRecord', () => {
  it('works on empty record', () => {
    expectTypeOf<RequiredOfRecord<{}>>().toEqualTypeOf<{}>()
  })

  it('removes all optional types', () => {
    expectTypeOf<
      RequiredOfRecord<{ a?: 1; b?: true; c?: 'a' }>
    >().toEqualTypeOf<{}>()
  })

  it('leaves all mandatory types alone', () => {
    type T = { a: 1; b: true; c: 'a' }
    expectTypeOf<RequiredOfRecord<T>>().toEqualTypeOf<T>()
  })
})
