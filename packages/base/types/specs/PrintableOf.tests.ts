import { type PrintableOf } from 'types/PrintableOf'

describe('PrintableOf', function () {
  it('filters out the non-printable types', function () {
    type T = PrintableOf<string | number | boolean>
    expectTypeOf<T>().toEqualTypeOf<string | number>()
  })
})
