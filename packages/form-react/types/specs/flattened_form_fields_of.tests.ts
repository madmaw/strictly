import { type FlattenedFormFieldsOf } from 'types/flattened_form_fields_of'
import { type FormField } from 'types/form_field'

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
          readonly x: FormField<string, 1>,
          readonly z: FormField<string, 3>,
        }
      >

      expectTypeOf<T>().toEqualTypeOf<{
        readonly a: FormField<string, 1>,
        readonly c: FormField<string, 3>,
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
          readonly w: FormField<string, 0>,
          readonly x: FormField<string, 1>,
        }
      >

      expectTypeOf<T>().toEqualTypeOf<never>()
    })
  })
})
