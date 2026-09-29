import { type Simplify } from 'type-fest'
import {
  booleanType,
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type ReadonlyField } from 'types/Type'
import { type ValueOfType } from 'types/ValueOfType'
import { type ErrorsOfType, type Rules } from 'validation/rules'
import { type z } from 'zod'

type NumberSchema = z.ZodNumber & Rules<never, {}>
type StringSchema = z.ZodString & Rules<never, {}>
type BooleanSchema = z.ZodBoolean & Rules<never, {}>

describe('FlattenedTypesOfType', () => {
  describe('literal', () => {
    type T = Simplify<FlattenedTypesOfType<typeof numberType.narrow, null>>

    type C = {
      readonly $: NumberSchema
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', () => {
    const t = list(numberType).narrow
    type T = Simplify<FlattenedTypesOfType<typeof t, '*'>>

    type C = {
      readonly $: typeof t
      readonly ['$.*']: NumberSchema
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('record', () => {
    const t = record<typeof numberType, 'a' | 'b'>(numberType).narrow
    type T = Simplify<FlattenedTypesOfType<typeof t, '*'>>

    type C = {
      readonly $: typeof t
      readonly ['$.*']: NumberSchema
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('object', () => {
    describe('simple', () => {
      const t = object()
        .field('a', numberType)
        .optionalField('b', stringType)
        .readonlyField('c', booleanType)
        .readonlyOptionalField('d', stringType).narrow
      type T = Simplify<FlattenedTypesOfType<typeof t, null>>
      type C = {
        readonly $: typeof t
        readonly ['$.a']: NumberSchema
        readonly ['$.b']: z.ZodOptional<StringSchema>
        readonly ['$.c']: ReadonlyField<BooleanSchema>
        readonly ['$.d']: ReadonlyField<z.ZodOptional<StringSchema>>
      }
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('optional', () => {
      const t = object().optionalField('a', stringType).narrow
      type T = Simplify<FlattenedTypesOfType<typeof t, null>>

      type C = {
        readonly $: typeof t
        readonly '$.a': z.ZodOptional<StringSchema>
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })

      it('has an optional value at the path', () => {
        expectTypeOf<ValueOfType<T['$.a']>>().toEqualTypeOf<
          string | undefined
        >()
      })
    })

    describe('rules', () => {
      const t = object()
        .field(
          'a',
          numberType.enforce((): 'a' => 'a'),
        )
        .field('b', numberType).narrow
      type T = Simplify<FlattenedTypesOfType<typeof t, null>>

      it('keeps the rules of each path', () => {
        expectTypeOf<ErrorsOfType<T['$.a']>>().toEqualTypeOf<'a'>()
        expectTypeOf<ErrorsOfType<T['$.b']>>().toEqualTypeOf<never>()
      })
    })
  })
})

describe('union', () => {
  describe('overlapping', () => {
    describe('non-discriminated', () => {
      const t = union()
        .or('x', object().field('a', booleanType))
        .or('y', object().field('b', numberType)).narrow
      type T = Simplify<FlattenedTypesOfType<typeof t, null>>

      type C = {
        readonly $: typeof t
        readonly ['$.a']: BooleanSchema
        readonly ['$.b']: NumberSchema
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('discriminated', () => {
      const t = union('x')
        .or('1', object().field('a', booleanType))
        .or('2', object().field('a', numberType)).narrow
      type T = Simplify<FlattenedTypesOfType<typeof t, null>>

      type C = {
        readonly $: typeof t
        readonly ['$:1.a']: BooleanSchema
        readonly ['$:1.x']: z.ZodLiteral<'1'>
        readonly ['$:2.a']: NumberSchema
        readonly ['$:2.x']: z.ZodLiteral<'2'>
      }
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('nested discriminated', () => {
      const inner = union('y')
        .or('p', object().field('a', booleanType))
        .or('q', object().field('b', numberType)).narrow
      const t = union('x')
        .or('1', inner)
        .or('2', object().field('c', stringType)).narrow

      it('has a path for every field of every nested option', () => {
        expectTypeOf<
          keyof FlattenedTypesOfType<typeof t, null>
        >().toEqualTypeOf<
          | '$'
          | '$:1:p.a'
          | '$:1:p.x'
          | '$:1:p.y'
          | '$:1:q.b'
          | '$:1:q.x'
          | '$:1:q.y'
          | '$:2.c'
          | '$:2.x'
        >()
      })
    })
  })
})
