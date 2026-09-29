import { type FieldAdapter } from 'core/mobx/FieldAdapter'
import { type FlattenedAdaptersOfFields } from 'core/mobx/FlattenedAdaptersOfFields'
import { type Field } from 'types/Field'
import { type z } from 'zod'

const error = Symbol()
type Error = typeof error

describe('FlattenedAdaptersOfFields', () => {
  it('maps the converter types', () => {
    type Fields = {
      a: Field<string, Error>
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b'
      },
      {
        b: z.ZodNumber
      },
      Fields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>
    }>()
  })

  it('ignores extraneous types not listed in the fields', () => {
    type FormFields = {
      a: Field<string, Error>
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b'
        c: 'd'
      },
      {
        b: z.ZodNumber
        d: z.ZodBoolean
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>
    }>()
  })

  it('handles multiple fields', () => {
    type FormFields = {
      a: Field<string, Error>
      c: Field<boolean, never>
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b'
        c: 'd'
      },
      {
        b: z.ZodNumber
        d: z.ZodBoolean
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>
      readonly d: FieldAdapter<boolean, boolean, never, 'c'>
    }>()
  })

  it('allows synthesized fields', () => {
    type FormFields = {
      a: Field<string, Error>
      c: Field<boolean, never>
    }
    type T = FlattenedAdaptersOfFields<
      {
        a: 'b'
        c: 'd'
      },
      {
        b: z.ZodNumber
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: FieldAdapter<number, string, Error, 'a'>
      readonly d: FieldAdapter<boolean, boolean, never, 'c'>
    }>()
  })
})
