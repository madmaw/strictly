import { type Validator } from '@strictly/base'
import { type Field } from 'form/types/Field'
import { type FlattenedValidatorsOfFields } from 'form/types/FlattenedValidatorsOfFields'
import { type z } from 'zod'

const error = Symbol()
type Error = typeof error

describe('FlattenedValidatorsOfFields', () => {
  it('maps the converter types', () => {
    type Fields = {
      a: Field<string, Error>
    }
    type T = FlattenedValidatorsOfFields<
      {
        a: 'b'
      },
      {
        b: z.ZodNumber
      },
      Fields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: Validator<number, Error, 'a'>
    }>()
  })

  it('ignores extraneous types not listed in the fields', () => {
    type FormFields = {
      a: Field<string, Error>
    }
    type T = FlattenedValidatorsOfFields<
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
      readonly b: Validator<number, Error, 'a'>
    }>()
  })

  it('handles multiple fields', () => {
    type FormFields = {
      a: Field<string, Error>
      c: Field<boolean, never>
    }
    type T = FlattenedValidatorsOfFields<
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
      readonly b: Validator<number, Error, 'a'>
      readonly d: Validator<boolean, never, 'c'>
    }>()
  })

  it('allows synthesized fields', () => {
    type FormFields = {
      a: Field<string, Error>
      c: Field<number, never>
    }
    type T = FlattenedValidatorsOfFields<
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
      readonly b: Validator<number, Error, 'a'>
      readonly d: Validator<number, never, 'c'>
    }>()
  })
})
