import { type Field } from 'types/field'
import { type StringFieldsOfFields } from 'types/string_fields_of_fields'

describe('StringFieldsOfFields', function () {
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
      expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
        s: Field<E2, string>,
      }>()
    })
  })

  describe('string union with null', function () {
    const e = Symbol()
    type E = typeof e
    type F = {
      s: Field<E, 'a' | 'b' | 'c' | null | undefined>,
    }

    describe('StringFieldsOfFields', function () {
      it('equals expected type', function () {
        expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
          s: Field<E, 'a' | 'b' | 'c' | null | undefined>,
        }>()
      })
    })
  })
})
