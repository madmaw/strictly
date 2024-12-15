import { type Field } from 'types/field'
import { type FlattenedFormFieldsOf } from 'types/flattened_form_fields_of'

describe('FlattenedFormFieldsOf', function () {
  describe('subset', function () {
    it('equals expected type', function () {
      type T = FlattenedFormFieldsOf<
        {
          readonly a: 'x',
          readonly b: 'y',
          readonly c: 'z',
        },
        {
          readonly x: Field<1, string>,
          readonly z: Field<3, string>,
        }
      >

      expectTypeOf<T>().toEqualTypeOf<{
        readonly a: Field<1, string>,
        readonly c: Field<3, string>,
      }>()
    })
  })

  describe('overlap', function () {
    it('equals never', function () {
      type T = FlattenedFormFieldsOf<
        {
          readonly a: 'x',
          readonly b: 'y',
          readonly c: 'z',
        },
        {
          readonly w: Field<0, string>,
          readonly x: Field<1, string>,
        }
      >

      expectTypeOf<T>().toEqualTypeOf<never>()
    })
  })
})
