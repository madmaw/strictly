import {
  type booleanType,
  type numberType,
} from '@strictly/define'
import { type FieldAdapter } from 'core/mobx/field_adapter'
import { type FlattenedAdaptersOfFields } from 'core/mobx/flattened_adapters_of_fields'
import { type Field } from 'types/field'

const error = Symbol()
type Error = typeof error

describe('FlattenedAdaptersOfFIelds', function () {
  it('maps the converter types', function () {
    type Fields = {
      a: Field<string, Error>,
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b',
      },
      {
        b: typeof numberType,
      },
      Fields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>,
    }>()
  })

  it('ignores extraneous types not listed in the fields', function () {
    type FormFields = {
      a: Field<string, Error>,
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b',
        c: 'd',
      },
      {
        b: typeof numberType,
        d: typeof booleanType,
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>,
    }>()
  })

  it('handles multiple fields fields', function () {
    type FormFields = {
      a: Field<string, Error>,
      c: Field<boolean, never>,
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b',
        c: 'd',
      },
      {
        b: typeof numberType,
        d: typeof booleanType,
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>,
      readonly d: FieldAdapter<boolean, boolean, never, 'c'>,
    }>()
  })
})
