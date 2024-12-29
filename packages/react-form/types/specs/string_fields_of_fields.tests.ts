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
      b: Field<boolean, E1>,
      s: Field<string, E2>,
      n: Field<number, E3>,
    }

    it('equals expected type', function () {
      expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
        s: Field<string, E2>,
      }>()
    })
  })

  describe('string union with null', function () {
    const e = Symbol()
    type E = typeof e
    type F = {
      s: Field<'a' | 'b' | 'c' | null | undefined, E>,
    }

    describe('StringFieldsOfFields', function () {
      it('equals expected type', function () {
        expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
          s: Field<'a' | 'b' | 'c' | null | undefined, E>,
        }>()
      })
    })
  })
})
