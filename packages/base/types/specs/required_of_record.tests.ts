import { type RequiredOfRecord } from 'types/required_of_record'

describe('RequiredOfRecord', function () {
  it('works on empty record', function () {
    expectTypeOf<RequiredOfRecord<{}>>().toEqualTypeOf<{}>()
  })

  it('removes all optional types', function () {
    expectTypeOf<RequiredOfRecord<{ a?: 1, b?: true, c?: 'a' }>>().toEqualTypeOf<{}>()
  })

  it('leaves all mandatory types alone', function () {
    type T = { a: 1, b: true, c: 'a' }
    expectTypeOf<RequiredOfRecord<T>>().toEqualTypeOf<T>()
  })
})
