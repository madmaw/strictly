import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import {
  booleanType,
  list,
  nullable,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type FlattenedTypesOfType } from 'types/flattened_types_of_type'
import { type ValueToTypePathsOfType } from 'types/value_to_type_paths_of_type'

describe('ValueToTypePathsOfType', function () {
  describe('literal', function () {
    type T = ValueToTypePathsOfType<typeof numberType.narrow>

    type C = {
      readonly $: '$',
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(list(numberType))
    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder.narrow>>

    type C = {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('record', function () {
    const l = list(numberType)
    const builder = record<typeof l, 'a' | 'b'>(l)
    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    type C = {
      readonly $: '$',
      readonly [`$.a`]: '$.*',
      readonly [`$.b`]: '$.*',
      readonly [_: `$.a.${number}`]: '$.*.*',
      readonly [_: `$.b.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    it('allows lookup of type path', function () {
      expectTypeOf<T['$.a.1']>().toEqualTypeOf<'$.*.*'>()
    })
  })

  describe('object', function () {
    const builder = object()
      .field('a', list(numberType))
      .optionalField('b', booleanType)
      .readonlyField('c', stringType)
      .readonlyOptionalField('d', stringType)

    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    type C = {
      readonly $: '$',
      readonly [`$.a`]: '$.a',
      readonly [`$.b`]: '$.b',
      readonly [`$.c`]: '$.c',
      readonly [`$.d`]: '$.d',
      readonly [_: `$.a.${number}`]: '$.a.*',
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    it('has the same value paths', function () {
      type ValuePaths = keyof FlattenedTypesOfType<typeof builder, null>
      expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
    })

    it('has the same type paths', function () {
      type TypePaths = keyof FlattenedTypesOfType<typeof builder, '*'>
      expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      const builder = union()
        .or('1', list(numberType))
        .or('2', stringType)
      type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

      type C = {
        readonly $: '$',
        readonly [_: `$.${number}`]: '$.*',
      }

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('discriminated', function () {
      const builder = union('d')
        .or('1', object().field('a', booleanType).field('b', numberType))
        .or('2', object().field('x', numberType).field('y', stringType))
      type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

      type C = {
        readonly $: '$',
        readonly ['$:1.a']: '$:1.a',
        readonly ['$:1.b']: '$:1.b',
        readonly ['$:2.x']: '$:2.x',
        readonly ['$:2.y']: '$:2.y',
      }
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })

      it('has the same value paths', function () {
        type ValuePaths = keyof FlattenedTypesOfType<typeof builder, null>
        expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
      })

      it('has the same type paths', function () {
        type TypePaths = keyof FlattenedTypesOfType<typeof builder, '*'>
        expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
      })
    })
  })

  describe('readonly', function () {
    const builder = list(list(numberType)).readonly()

    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    type C = {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('nullable', function () {
    const builder = nullable(list(nullable(list(numberType))))

    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    type C = {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })

    it('has the same value paths', function () {
      type ValuePaths = keyof FlattenedTypesOfType<typeof builder, null>
      expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
    })

    it('has the same type paths', function () {
      type TypePaths = keyof FlattenedTypesOfType<typeof builder, '*'>
      expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
    })
  })
})
