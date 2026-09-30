import {
  nullable,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'define/types/builders'
import { type FlattenedValuesOfType } from 'define/types/FlattenedValuesOfType'

describe('FlattenedValuesOfType', () => {
  // note we only test a small example since most of the work is done in flatten
  describe('record', () => {
    const t = record<typeof numberType, string>(numberType).narrow
    type V = FlattenedValuesOfType<typeof t>

    type C = {
      readonly $: Record<string, number>
      readonly [_: `$.${string}`]: number
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })

  describe('object', () => {
    const t = object()
      .optionalField('a', stringType)
      .field('b', nullable(numberType)).narrow
    type V = FlattenedValuesOfType<typeof t>

    type C = {
      readonly $: {
        a?: string | undefined
        b: number | null
      }
      readonly '$.a': string | undefined
      readonly '$.b': number | null
    }

    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<V>()
    })
  })

  describe('discriminated union', () => {
    const t = union('d')
      .or('x', object().field('a', numberType))
      .or('y', object().field('b', stringType)).narrow
    type V = FlattenedValuesOfType<typeof t>

    it('equals expected type', () => {
      expectTypeOf<V['$:x.a']>().toEqualTypeOf<number>()
      expectTypeOf<V['$:x.d']>().toEqualTypeOf<'x'>()
      expectTypeOf<V['$:y.b']>().toEqualTypeOf<string>()
      expectTypeOf<V['$:y.d']>().toEqualTypeOf<'y'>()
    })
  })
})
