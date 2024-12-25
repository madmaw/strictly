import { type PrintableOf } from 'types/printable_of'

describe('PrintableOf', function () {
  it('filters out the non-printable types', function () {
    type T = PrintableOf<string | number | boolean>
    expectTypeOf<T>().toEqualTypeOf<string | number>()
  })
})
