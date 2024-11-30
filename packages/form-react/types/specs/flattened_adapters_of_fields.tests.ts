import {
  type boolean,
  type number,
} from '@de/fine'
import { type FieldAdapter } from 'core/mobx/field_adapter'
import { type Field } from 'types/field'
import { type FlattenedAdaptersOfFields } from 'types/flattened_adapters_of_fields'

describe('FlattenedAdaptersOfFIelds', function () {
  it('maps the converter types', function () {
    type Fields = {
      a: Field<string, string>,
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b',
      },
      {
        b: typeof number,
      },
      Fields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<string, Fields, number, string>,
    }>()
  })

  it('ignores extraneous types not listed in the fields', function () {
    type FormFields = {
      a: Field<string, string>,
    }
    type T = FlattenedAdaptersOfFields<
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
      readonly b: FieldAdapter<string, FormFields, number, string>,
    }>()
  })
})
