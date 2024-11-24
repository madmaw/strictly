import {
  type boolean,
  type number,
} from '@de/fine'
import { type Converter } from 'types/converter'
import { type FlattenedConvertersOfFormFields } from 'types/flattened_converters_of_form_fields'
import { type FormField } from 'types/form_field'

describe('FlattenedConvertersOfFormFIelds', function () {
  it('maps the converter types', function () {
    type FormFields = {
      a: FormField<string, string>,
    }
    type T = FlattenedConvertersOfFormFields<
      {
        a: 'b',
      },
      {
        b: typeof number,
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: Converter<string, FormFields, number, string>,
    }>()
  })

  it('ignores extraneous types not listed in the fields', function () {
    type FormFields = {
      a: FormField<string, string>,
    }
    type T = FlattenedConvertersOfFormFields<
      {
        a: 'b',
        c: 'd',
      },
      {
        b: typeof number,
        d: typeof boolean,
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: Converter<string, FormFields, number, string>,
    }>()
  })
})
