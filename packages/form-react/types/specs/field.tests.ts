import {
  type BooleanFieldsOfFields,
  type ErrorTypeOfField,
  type Field,
  type StringFieldsOfFields,
  type ValueTypeOfField,
} from 'types/field'

describe('Field', function () {
  describe('ErrorTypeOfField', function () {
    it('equals expected type', function () {
      const e = Symbol()
      type E = typeof e
      expectTypeOf<ErrorTypeOfField<Field<E, unknown>>>().toEqualTypeOf<E>()
    })
  })

  describe('ValueTypeOfField', function () {
    it('equals expected type', function () {
      const v = Symbol()
      type V = typeof v
      expectTypeOf<ValueTypeOfField<Field<unknown, V>>>().toEqualTypeOf<V>()
    })
  })

  describe('FieldsOfFields', function () {
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

      describe('BooleanFieldsOfFields', function () {
        it('equals expected type', function () {
          expectTypeOf<BooleanFieldsOfFields<F>>().toEqualTypeOf<{
            b: Field<E1, boolean>,
          }>()
        })
      })

      describe('StringFieldsOfFields', function () {
        it('equals expected type', function () {
          expectTypeOf<StringFieldsOfFields<F>>().toEqualTypeOf<{
            s: Field<E2, string>,
          }>()
        })
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
})
