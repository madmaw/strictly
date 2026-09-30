import {
  booleanType,
  define,
  list,
  literal,
  nullable,
  numberType,
  object,
  readonlyField,
  record,
  stringType,
  union,
} from 'define/types/builders'
import { type ValueOfType } from 'define/types/ValueOfType'
import {
  annotationsOf,
  type ContextOfType,
  type ErrorsOfType,
  metaOf,
  type Rules,
} from 'define/validation/rules'
import { z } from 'zod'

describe('builder', () => {
  describe('literal', () => {
    const t = numberType.narrow

    it('equals expected type', () => {
      expectTypeOf(t).toEqualTypeOf<z.ZodNumber & Rules<never, {}>>()
      expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<number>()
      expectTypeOf<ErrorsOfType<typeof t>>().toEqualTypeOf<never>()
      expectTypeOf<ContextOfType<typeof t>>().toEqualTypeOf<{}>()
    })

    it('has no annotations or rules', () => {
      expect(annotationsOf(t)).toEqual({
        required: false,
        readonly: false,
      })
      expect(metaOf(t).rules).toEqual([])
    })

    describe('typed', () => {
      const t = literal<'a' | 'b'>().narrow

      it('equals expected type', () => {
        expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<'a' | 'b'>()
      })
    })

    describe('enumerated', () => {
      const t = literal(['a', 'b']).narrow

      it('equals expected type', () => {
        expectTypeOf(t).toEqualTypeOf<
          z.ZodLiteral<'a' | 'b'> & Rules<never, {}>
        >()
        expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<'a' | 'b'>()
      })

      it('only parses the supplied values', () => {
        expect(t.safeParse('a').success).toBe(true)
        expect(t.safeParse('c').success).toBe(false)
      })
    })

    describe('nullable', () => {
      const t = nullable(numberType).narrow

      it('equals expected type', () => {
        expectTypeOf(t).toEqualTypeOf<
          z.ZodNullable<z.ZodNumber & Rules<never, {}>> & Rules<never, {}>
        >()
        expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<number | null>()
      })
    })

    describe('required', () => {
      const t = numberType.required().narrow

      it('equals expected value', () => {
        expect(annotationsOf(t)).toEqual({
          required: true,
          readonly: false,
        })
      })

      it('does not mutate the shared schema', () => {
        expect(t).not.toBe(numberType.schema)
        expect(annotationsOf(numberType.narrow)).toEqual({
          required: false,
          readonly: false,
        })
      })
    })

    describe('readonly', () => {
      const t = numberType.readonly().narrow

      it('equals expected value', () => {
        expect(annotationsOf(t)).toEqual({
          required: false,
          readonly: true,
        })
      })
    })

    describe('readonly & required', () => {
      const t = numberType.readonly().required().narrow

      it('equals expected value', () => {
        expect(annotationsOf(t)).toEqual({
          required: true,
          readonly: true,
        })
      })
    })

    describe('enforce', () => {
      const isEven = (v: number): 'odd' | null => (v % 2 === 0 ? null : 'odd')
      const isPositive = (
        v: number,
        _path: string,
        { allowZero }: { readonly allowZero: boolean },
      ): 'negative' | null =>
        v > 0 || (allowZero && v === 0) ? null : 'negative'
      const t = numberType.enforce(isEven).enforce(isPositive).narrow

      it('accumulates the error and context types', () => {
        expectTypeOf<ErrorsOfType<typeof t>>().toEqualTypeOf<
          'odd' | 'negative'
        >()
        expectTypeOf<ContextOfType<typeof t>>().toEqualTypeOf<{
          readonly allowZero: boolean
        }>()
        expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<number>()
      })

      it('registers the rules in order', () => {
        expect(metaOf(t).rules).toEqual([isEven, isPositive])
      })

      it('only declares the error type when no rule is supplied', () => {
        const declared = numberType.enforce<'declared'>().narrow
        expectTypeOf<
          ErrorsOfType<typeof declared>
        >().toEqualTypeOf<'declared'>()
        expect(metaOf(declared).rules).toEqual([])
      })
    })
  })

  describe('list', () => {
    describe('numeric list', () => {
      describe('mutable', () => {
        const t = list(numberType).narrow

        it('equals expected type', () => {
          expectTypeOf(t).toEqualTypeOf<
            z.ZodArray<z.ZodNumber & Rules<never, {}>> & Rules<never, {}>
          >()
          expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<number[]>()
        })
      })
    })

    describe('readonlyElements', () => {
      const t = list(numberType).readonlyElements().narrow

      it('equals expected type', () => {
        expectTypeOf(t).toEqualTypeOf<
          z.ZodReadonly<z.ZodArray<z.ZodNumber & Rules<never, {}>>> &
            Rules<never, {}>
        >()
        expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<readonly number[]>()
      })

      it('annotates the elements as readonly', () => {
        expect(annotationsOf(t.def.innerType.def.element)).toEqual({
          required: false,
          readonly: true,
        })
      })
    })
  })

  describe('record', () => {
    describe('numeric record', () => {
      describe('mutable', () => {
        const t = record<typeof numberType, 'a' | 'b' | 'c'>(numberType).narrow

        it('equals expected type', () => {
          expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<
            Record<'a' | 'b' | 'c', number>
          >()
        })
      })

      describe('readonly', () => {
        const t = record<typeof numberType, 'a' | 'b' | 'c'>(
          numberType,
        ).readonlyKeys().narrow

        it('equals expected type', () => {
          expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<
            Readonly<Record<'a' | 'b' | 'c', number>>
          >()
        })

        it('annotates the values as readonly', () => {
          expect(annotationsOf(t.def.innerType.def.valueType)).toEqual({
            required: false,
            readonly: true,
          })
        })
      })

      describe('partial', () => {
        const t = record<typeof numberType, 'a' | 'b' | 'c'>(
          numberType,
        ).partialKeys().narrow

        it('equals expected type', () => {
          expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<
            Partial<Record<'a' | 'b' | 'c', number>>
          >()
        })
      })

      describe('partial and readonly', () => {
        const t = record<typeof numberType, 'a' | 'b' | 'c'>(numberType)
          .partialKeys()
          .readonlyKeys().narrow

        it('equals expected type', () => {
          expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<
            Partial<Readonly<Record<'a' | 'b' | 'c', number>>>
          >()
        })
      })
    })
  })

  describe('object', () => {
    const t = object()
      .field('a', numberType)
      .readonlyField('b', booleanType)
      .optionalField('c', stringType)
      .readonlyOptionalField('d', numberType).narrow

    it('equals expected type', () => {
      expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<{
        a: number
        readonly b: boolean
        c?: string | undefined
        readonly d?: number | undefined
      }>()
    })

    it('annotates readonly fields', () => {
      expect(annotationsOf(t.def.shape.a)).toEqual({
        required: false,
        readonly: false,
      })
      expect(annotationsOf(t.def.shape.b)).toEqual({
        required: false,
        readonly: true,
      })
      expect(annotationsOf(t.def.shape.c)).toEqual({
        required: false,
        readonly: false,
      })
      expect(annotationsOf(t.def.shape.d)).toEqual({
        required: false,
        readonly: true,
      })
    })

    it('parses as a zod schema', () => {
      expect(
        t.safeParse({
          a: 1,
          b: true,
        }).success,
      ).toBe(true)
      expect(t.safeParse({ a: 1 }).success).toBe(false)
    })

    describe('raw zod shape', () => {
      const raw = define(
        z.object({
          a: readonlyField(z.string()),
          b: z.number().optional(),
        }),
      ).narrow

      it('equals expected type', () => {
        expectTypeOf<ValueOfType<typeof raw>>().toEqualTypeOf<{
          readonly a: string
          b?: number | undefined
        }>()
      })

      it('annotates readonly fields', () => {
        expect(annotationsOf(raw.def.shape.a)).toEqual({
          required: false,
          readonly: true,
        })
      })
    })
  })

  describe('union', () => {
    describe('literals', () => {
      const t = union().or('1', numberType).or('2', stringType).narrow

      it('equals expected type', () => {
        expectTypeOf(t).toEqualTypeOf<
          z.ZodUnion<
            [z.ZodNumber & Rules<never, {}>, z.ZodString & Rules<never, {}>]
          > &
            Rules<never, {}>
        >()
        expectTypeOf<ValueOfType<typeof t>>().toEqualTypeOf<number | string>()
      })
    })

    describe('objects', () => {
      describe('mutable', () => {
        const t = union()
          .or('1', object().field('a', booleanType))
          .or('2', object().field('b', numberType)).narrow

        it('equals expected type', () => {
          type C = { a: boolean } | { b: number }
          expectTypeOf<ValueOfType<typeof t>>().toMatchTypeOf<C>()
          expectTypeOf<C>().toMatchTypeOf<ValueOfType<typeof t>>()
        })
      })
    })

    describe('discriminated', () => {
      const t = union('d')
        .or('1', object().field('a', booleanType))
        .or('2', object().field('b', numberType)).narrow

      it('equals expected type', () => {
        type C = { d: '1'; a: boolean } | { d: '2'; b: number }
        expectTypeOf<ValueOfType<typeof t>>().toMatchTypeOf<C>()
        expectTypeOf<C>().toMatchTypeOf<ValueOfType<typeof t>>()
      })

      it('adds the discriminator to each option', () => {
        const [option1, option2] = t.def.options
        expect(annotationsOf(option1.def.shape.d)).toEqual({
          required: true,
          readonly: true,
        })
        expect(option1.def.shape.d.def.values).toEqual(['1'])
        expect(option2.def.shape.d.def.values).toEqual(['2'])
      })

      it('parses as a zod schema', () => {
        expect(
          t.safeParse({
            d: '1',
            a: true,
          }).success,
        ).toBe(true)
        expect(
          t.safeParse({
            d: '1',
            b: 1,
          }).success,
        ).toBe(false)
      })

      it('rejects options that are not objects', () => {
        expect(() => union('d').or('1', numberType)).toThrow()
      })
    })

    describe('nested discriminated', () => {
      const inner = union('y')
        .or('p', object().field('a', booleanType))
        .or('q', object().field('b', numberType)).narrow
      const t = union('x')
        .or('1', inner)
        .or('2', object().field('c', stringType)).narrow

      it('equals expected type', () => {
        type C =
          | { x: '1'; y: 'p'; a: boolean }
          | { x: '1'; y: 'q'; b: number }
          | { x: '2'; c: string }
        expectTypeOf<ValueOfType<typeof t>>().toMatchTypeOf<C>()
        expectTypeOf<C>().toMatchTypeOf<ValueOfType<typeof t>>()
      })

      it('adds the discriminator to the options of the nested union', () => {
        const [nested] = t.def.options
        const [option1, option2] = nested.def.options
        expect(option1.def.shape.x.def.values).toEqual(['1'])
        expect(option2.def.shape.x.def.values).toEqual(['1'])
      })

      it('parses as a zod schema', () => {
        expect(t.safeParse({ x: '1', y: 'q', b: 1 }).success).toBe(true)
        expect(t.safeParse({ x: '1', c: '' }).success).toBe(false)
      })
    })
  })
})
