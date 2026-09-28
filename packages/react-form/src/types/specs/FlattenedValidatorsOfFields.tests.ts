import {
  type booleanType,
  type numberType,
  type Validator,
} from '@strictly/define'
import { type Field } from 'types/Field'
import { type FlattenedValidatorsOfFields } from 'types/FlattenedValidatorsOfFields'

const error = Symbol()
type Error = typeof error

describe('FlattenedValidatorsOfFields', function () {
  it('maps the converter types', function () {
    type Fields = {
      a: Field<string, Error>,
    }
    type T = FlattenedValidatorsOfFields<
      {
        a: 'b',
      },
      {
        b: typeof numberType,
      },
      Fields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: Validator<number, Error, 'a'>,
    }>()
  })

  it('ignores extraneous types not listed in the fields', function () {
    type FormFields = {
      a: Field<string, Error>,
    }
    type T = FlattenedValidatorsOfFields<
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
      readonly b: Validator<number, Error, 'a'>,
    }>()
  })

  it('handles multiple fields', function () {
    type FormFields = {
      a: Field<string, Error>,
      c: Field<boolean, never>,
    }
    type T = FlattenedValidatorsOfFields<
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
      readonly b: Validator<number, Error, 'a'>,
      readonly d: Validator<boolean, never, 'c'>,
    }>()
  })

  it('allows synthesized fields', function () {
    type FormFields = {
      a: Field<string, Error>,
      c: Field<number, never>,
    }
    type T = FlattenedValidatorsOfFields<
      {
        a: 'b',
        c: 'd',
      },
      {
        b: typeof numberType,
      },
      FormFields
    >
    expectTypeOf<T>().toEqualTypeOf<{
      readonly b: Validator<number, Error, 'a'>,
      readonly d: Validator<number, never, 'c'>,
    }>()
  })
})
