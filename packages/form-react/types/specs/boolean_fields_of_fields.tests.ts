import { type BooleanFieldsOfFields } from 'types/boolean_fields_of_fields'
import { type Field } from 'types/field'

describe('BooleanFieldsOfFields', function () {
  describe('filtering', function () {
    const e1 = Symbol()
    const e2 = Symbol()
    const e3 = Symbol()
    type E1 = typeof e1
    type E2 = typeof e2
    type E3 = typeof e3
    type F = {
      b: Field<E1, boolean>,
      s: Field<E2, string>,
      n: Field<E3, number>,
    }
    it('equals expected type', function () {
      expectTypeOf<BooleanFieldsOfFields<F>>().toEqualTypeOf<{
        b: Field<E1, boolean>,
      }>()
    })
  })
})
