import { type PrintableOf } from 'types/PrintableOf'

describe('PrintableOf', () => {
  it('filters out the non-printable types', () => {
    type T = PrintableOf<string | number | boolean>
    expectTypeOf<T>().toEqualTypeOf<string | number>()
  })
})
