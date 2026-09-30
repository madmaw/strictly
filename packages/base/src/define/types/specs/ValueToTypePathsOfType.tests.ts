import {
  booleanType,
  list,
  nullable,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'define/types/builders'
import { type FlattenedTypesOfType } from 'define/types/FlattenedTypesOfType'
import { type ValueToTypePathsOfType } from 'define/types/ValueToTypePathsOfType'
import { type ValueOf } from 'type-fest'

describe('ValueToTypePathsOfType', () => {
  describe('literal', () => {
    type T = ValueToTypePathsOfType<typeof numberType.narrow>

    type C = {
      readonly $: '$'
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', () => {
    const t = list(list(numberType)).narrow
    type T = ValueToTypePathsOfType<typeof t>

    type C = {
      readonly $: '$'
      readonly [_: `$.${number}`]: '$.*'
      readonly [_: `$.${number}.${number}`]: '$.*.*'
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('record', () => {
    const l = list(numberType)
    const t = record<typeof l, 'a' | 'b'>(l).narrow
    type T = ValueToTypePathsOfType<typeof t>

    type C = {
      readonly $: '$'
      readonly ['$.a']: '$.*'
      readonly ['$.b']: '$.*'
      readonly [_: `$.a.${number}`]: '$.*.*'
      readonly [_: `$.b.${number}`]: '$.*.*'
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    it('allows lookup of type path', () => {
      expectTypeOf<T['$.a.1']>().toEqualTypeOf<'$.*.*'>()
    })
  })

  describe('object', () => {
    const t = object()
      .field('a', list(numberType))
      .optionalField('b', booleanType)
      .readonlyField('c', stringType)
      .readonlyOptionalField('d', stringType).narrow

    type T = ValueToTypePathsOfType<typeof t>

    type C = {
      readonly $: '$'
      readonly ['$.a']: '$.a'
      readonly ['$.b']: '$.b'
      readonly ['$.c']: '$.c'
      readonly ['$.d']: '$.d'
      readonly [_: `$.a.${number}`]: '$.a.*'
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    it('has the same value paths', () => {
      type ValuePaths = keyof FlattenedTypesOfType<typeof t, null>
      expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
    })

    it('has the same type paths', () => {
      type TypePaths = keyof FlattenedTypesOfType<typeof t, '*'>
      expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
    })
  })

  describe('union', () => {
    describe('non-discriminated', () => {
      const t = union().or('1', list(numberType)).or('2', stringType).narrow
      type T = ValueToTypePathsOfType<typeof t>

      type C = {
        readonly $: '$'
        readonly [_: `$.${number}`]: '$.*'
      }

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('discriminated', () => {
      const t = union('d')
        .or('1', object().field('a', booleanType).field('b', numberType))
        .or('2', object().field('x', numberType).field('y', stringType)).narrow
      type T = ValueToTypePathsOfType<typeof t>

      type C = {
        readonly $: '$'
        readonly ['$:1.a']: '$:1.a'
        readonly ['$:1.b']: '$:1.b'
        readonly ['$:1.d']: '$:1.d'
        readonly ['$:2.x']: '$:2.x'
        readonly ['$:2.y']: '$:2.y'
        readonly ['$:2.d']: '$:2.d'
      }
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })

      it('has the same value paths', () => {
        type ValuePaths = keyof FlattenedTypesOfType<typeof t, null>
        expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
      })

      it('has the same type paths', () => {
        type TypePaths = keyof FlattenedTypesOfType<typeof t, '*'>
        expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
      })
    })
  })

  describe('readonly', () => {
    const t = list(list(numberType)).readonlyElements().narrow

    type T = ValueToTypePathsOfType<typeof t>

    type C = {
      readonly $: '$'
      readonly [_: `$.${number}`]: '$.*'
      readonly [_: `$.${number}.${number}`]: '$.*.*'
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('nullable', () => {
    const t = nullable(list(nullable(list(numberType)))).narrow

    type T = ValueToTypePathsOfType<typeof t>

    type C = {
      readonly $: '$'
      readonly [_: `$.${number}`]: '$.*'
      readonly [_: `$.${number}.${number}`]: '$.*.*'
    }
    it('equals expected type', () => {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    it('has the same value paths', () => {
      type ValuePaths = keyof FlattenedTypesOfType<typeof t, null>
      expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
    })

    it('has the same type paths', () => {
      type TypePaths = keyof FlattenedTypesOfType<typeof t, '*'>
      expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
    })
  })
})
