import {
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type FlattenedValuesOfType } from 'types/FlattenedValuesOfType'
import {
  type IsReadonlyType,
  type ReadonlyTypeOfType,
} from 'types/ReadonlyTypeOfType'
import { type ValueOfType } from 'types/ValueOfType'

describe('ReadonlyTypeOfType', () => {
  describe('literal', () => {
    type T = ReadonlyTypeOfType<typeof numberType.narrow>

    it('is readonly', () => {
      expectTypeOf<IsReadonlyType<T>>().toEqualTypeOf<true>()
      expectTypeOf<
        IsReadonlyType<typeof numberType.narrow>
      >().toEqualTypeOf<false>()
    })

    it('has the same value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<number>()
    })

    it('is still the same schema at runtime', () => {
      const t: T = numberType.narrow as T
      expect(t.safeParse(1).success).toBe(true)
    })
  })

  describe('list', () => {
    const t = list(numberType).narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('has a readonly value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<readonly number[]>()
    })
  })

  describe('record', () => {
    const t = record<typeof numberType, 'a' | 'b'>(numberType).narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('has a readonly value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<
        Readonly<Record<'a' | 'b', number>>
      >()
    })
  })

  describe('object', () => {
    const t = object()
      .field('a', numberType)
      .optionalField('b', stringType).narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('has a readonly value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<{
        readonly a: number
        readonly b?: string | undefined
      }>()
    })

    it('propagates to the flattened children', () => {
      type Flattened = FlattenedTypesOfType<T, null>
      expectTypeOf<IsReadonlyType<Flattened['$.a']>>().toEqualTypeOf<true>()
      expectTypeOf<IsReadonlyType<Flattened['$.b']>>().toEqualTypeOf<true>()
    })
  })

  describe('union', () => {
    const t = union()
      .or('1', record<typeof numberType, 'a'>(numberType))
      .or('2', stringType).narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('has a readonly value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<
        Readonly<Record<'a', number>> | string
      >()
    })
  })

  describe('partial', () => {
    const t = record<typeof numberType, 'a'>(numberType).partialKeys().narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('has a readonly value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<{
        readonly a?: number
      }>()
    })
  })

  describe('readonly', () => {
    const t = record<typeof numberType, 'a'>(numberType).readonlyKeys().narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('has a readonly value', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<
        Readonly<Record<'a', number>>
      >()
    })
  })

  describe('nested', () => {
    const t = object().field(
      'l',
      list(object().field('r', record(numberType))),
    ).narrow
    type T = ReadonlyTypeOfType<typeof t>

    it('is readonly all the way down', () => {
      expectTypeOf<ValueOfType<T>>().toEqualTypeOf<{
        readonly l: readonly {
          readonly r: Readonly<Record<string, number>>
        }[]
      }>()
    })

    it('flattens to readonly values', () => {
      type Values = FlattenedValuesOfType<T, '*'>
      expectTypeOf<Values['$.l']>().toEqualTypeOf<
        readonly {
          readonly r: Readonly<Record<string, number>>
        }[]
      >()
      expectTypeOf<Values['$.l.*.r']>().toEqualTypeOf<
        Readonly<Record<string, number>>
      >()
    })
  })
})
