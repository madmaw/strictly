import {
  booleanType,
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
import { type ReadonlyTypeOfType } from 'define/types/ReadonlyTypeOfType'
import { type ValueOfType } from 'define/types/ValueOfType'
import { z } from 'zod'

describe('ValueOfType', () => {
  describe('literal', () => {
    const t = literal<'a' | 'b' | 'c'>().narrow
    type T = ValueOfType<typeof t>

    type C = 'a' | 'b' | 'c'
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    describe('nullable', () => {
      const t = nullable(numberType).narrow
      type T = ValueOfType<typeof t>

      type C = number | null
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('optional', () => {
      const t = z.optional(numberType.narrow)
      type T = ValueOfType<typeof t>

      type C = number | undefined
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('default', () => {
      const t = z.number().default(1)
      type T = ValueOfType<typeof t>

      type C = number
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('list', () => {
    describe('simple', () => {
      const t = list(literal<'a' | 'b' | 'c'>()).narrow
      type T = ValueOfType<typeof t>
      describe('mutable', () => {
        type C = ('a' | 'b' | 'c')[]
        it('equals expected type', () => {
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })

      describe('readonly elements', () => {
        const r = list(literal<'a' | 'b' | 'c'>()).readonlyElements().narrow
        type R = ValueOfType<typeof r>

        type C = readonly ('a' | 'b' | 'c')[]
        it('equals expected type', () => {
          expectTypeOf<C>().toEqualTypeOf<R>()
        })
      })

      describe('readonly type', () => {
        type R = ValueOfType<ReadonlyTypeOfType<typeof t>>

        type C = readonly ('a' | 'b' | 'c')[]
        it('equals expected type', () => {
          expectTypeOf<C>().toEqualTypeOf<R>()
        })
      })
    })

    describe('nested', () => {
      const t = list(list(numberType)).narrow
      type T = ValueOfType<typeof t>

      type C = number[][]
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })

      it('is readonly all the way down', () => {
        type R = ValueOfType<ReadonlyTypeOfType<typeof t>>
        expectTypeOf<readonly (readonly number[])[]>().toEqualTypeOf<R>()
      })
    })
  })

  describe('record', () => {
    const literalType = literal<'a' | 'b' | 'c'>()
    const t = record<typeof literalType, 'x' | 'y' | 'z'>(literalType).narrow
    type T = ValueOfType<typeof t>

    describe('mutable', () => {
      type C = Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly keys', () => {
      const r = record<typeof literalType, 'x' | 'y' | 'z'>(
        literalType,
      ).readonlyKeys().narrow
      type R = ValueOfType<typeof r>
      type C = Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<R>()
      })
    })

    describe('readonly type', () => {
      type R = ValueOfType<ReadonlyTypeOfType<typeof t>>
      type C = Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<R>()
      })
    })

    describe('partial', () => {
      const p = record<typeof literalType, 'x' | 'y' | 'z'>(
        literalType,
      ).partialKeys().narrow
      type T = ValueOfType<typeof p>

      type C = Partial<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('partial readonly', () => {
      const p = record<typeof literalType, 'x' | 'y' | 'z'>(literalType)
        .partialKeys()
        .readonlyKeys().narrow
      type T = ValueOfType<typeof p>

      type C = Partial<Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>>
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('unconstrained keys', () => {
      const s = record(numberType).narrow
      type T = ValueOfType<typeof s>

      type C = Record<string, number>
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('object', () => {
    const t = object()
      .field('a', literal<'a' | 'b'>())
      .field('b', numberType).narrow
    type T = ValueOfType<typeof t>

    describe('mutable', () => {
      type C = {
        a: 'a' | 'b'
        b: number
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly fields', () => {
      const r = object()
        .readonlyField('a', literal<'a' | 'b'>())
        .readonlyField('b', numberType).narrow
      type T = ValueOfType<typeof r>

      type C = {
        readonly a: 'a' | 'b'
        readonly b: number
      }
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly type', () => {
      type R = ValueOfType<ReadonlyTypeOfType<typeof t>>

      type C = {
        readonly a: 'a' | 'b'
        readonly b: number
      }
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<R>()
      })
    })

    describe('partial', () => {
      const p = object()
        .optionalField('a', literal<'a' | 'b'>())
        .optionalField('b', numberType).narrow
      type T = ValueOfType<typeof p>

      type C = {
        a?: 'a' | 'b' | undefined
        b?: number | undefined
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly partial', () => {
      const p = object()
        .readonlyOptionalField('a', literal<'a' | 'b'>())
        .optionalField('b', numberType).narrow
      type T = ValueOfType<typeof p>

      type C = {
        readonly a?: 'a' | 'b' | undefined
        b?: number | undefined
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly field of a mutable value', () => {
      const p = object().readonlyField('l', list(numberType)).narrow
      type T = ValueOfType<typeof p>

      type C = {
        readonly l: number[]
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('raw zod shape', () => {
      const raw = z.object({
        a: readonlyField(z.string()),
        b: z.number(),
        c: z.boolean().optional(),
      })
      type T = ValueOfType<typeof raw>

      type C = {
        readonly a: string
        b: number
        c?: boolean | undefined
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('extra', () => {
      const p = object().field('l', list(numberType)).narrow
      type Extra = { readonly x: true }
      type T = ValueOfType<typeof p, Extra>

      it('adds the extra type to every object and list', () => {
        expectTypeOf<T['x']>().toEqualTypeOf<true>()
        expectTypeOf<T['l']>().toEqualTypeOf<number[] & Extra>()
      })
    })
  })

  describe('union', () => {
    describe('non-discriminated', () => {
      const t = union()
        .or('0', literal([null]))
        .or('1', numberType)
        .or('2', stringType).narrow
      type T = ValueOfType<typeof t>

      type C = null | number | string

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('implicitly discriminated', () => {
      const t = union()
        .or(
          '0',
          object()
            .field('b', stringType)
            .readonlyField('d', literal([1])),
        )
        .or(
          '1',
          object()
            .field('b', numberType)
            .readonlyField('d', literal([2])),
        ).narrow
      type T = ValueOfType<typeof t>

      type C =
        | {
            readonly d: 1
            b: string
          }
        | {
            readonly d: 2
            b: number
          }

      it('equals expected type', () => {
        expectTypeOf<C>().toMatchTypeOf<T>()
        expectTypeOf<T>().toMatchTypeOf<C>()
      })
    })

    describe('explicitly discriminated', () => {
      const t = union('d')
        .or('1', object().field('b', stringType))
        .or('2', object().field('b', numberType)).narrow
      type T = ValueOfType<typeof t>

      type C =
        | {
            d: '1'
            b: string
          }
        | {
            d: '2'
            b: number
          }

      it('equals expected type', () => {
        expectTypeOf<C>().toMatchTypeOf<T>()
        expectTypeOf<T>().toMatchTypeOf<C>()
      })

      it('narrows on the discriminator', () => {
        function narrow(v: T) {
          if (v.d === '1') {
            expectTypeOf(v.b).toEqualTypeOf<string>()
          } else {
            expectTypeOf(v.b).toEqualTypeOf<number>()
          }
        }
        narrow({
          d: '1',
          b: 'x',
        })
      })
    })

    describe('readonly type', () => {
      const t = union('d')
        .or('1', object().field('b', list(stringType)))
        .or('2', object().field('b', booleanType)).narrow
      type T = ValueOfType<ReadonlyTypeOfType<typeof t>>

      type C =
        | {
            readonly d: '1'
            readonly b: readonly string[]
          }
        | {
            readonly d: '2'
            readonly b: boolean
          }

      it('equals expected type', () => {
        expectTypeOf<C>().toMatchTypeOf<T>()
        expectTypeOf<T>().toMatchTypeOf<C>()
      })
    })
  })
})
