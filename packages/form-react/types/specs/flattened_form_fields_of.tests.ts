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
          readonly x: Field<string, 1>,
          readonly z: Field<string, 3>,
        }
      >

      expectTypeOf<T>().toEqualTypeOf<{
        readonly a: Field<string, 1>,
        readonly c: Field<string, 3>,
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
          readonly w: Field<string, 0>,
          readonly x: Field<string, 1>,
        }
      >

      expectTypeOf<T>().toEqualTypeOf<never>()
    })
  })
})
