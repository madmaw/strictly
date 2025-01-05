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
    type T = ValueToTypePathsOfType<typeof numberType>

    let t: {
      readonly $: '$',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(list(numberType))
    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('record', function () {
    const l = list(numberType)
    const builder = record<typeof l, 'a' | 'b'>(l)
    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [`$.a`]: '$.*',
      readonly [`$.b`]: '$.*',
      readonly [_: `$.a.${number}`]: '$.*.*',
      readonly [_: `$.b.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })

    it('allows lookup of type path', function () {
      expectTypeOf<T['$.a.1']>().toEqualTypeOf<'$.*.*'>()
    })
  })

  describe('object', function () {
    const builder = object()
      .set('a', list(numberType))
      .setOptional('b', booleanType)
      .setReadonly('c', stringType)
      .setReadonlyOptional('d', stringType)
    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [`$.a`]: '$.a',
      readonly [`$.b`]: '$.b',
      readonly [`$.c`]: '$.c',
      readonly [`$.d`]: '$.d',
      readonly [_: `$.a.${number}`]: '$.a.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
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
        .add('1', list(numberType))
        .add('2', stringType)
      type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

      let t: {
        readonly $: '$',
        readonly [_: `$.${number}`]: '$.*',
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('discriminated', function () {
      const builder = union('d')
        .add('1', object().set('a', booleanType).set('b', numberType))
        .add('2', object().set('x', numberType).set('y', stringType))
      type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

      let t: {
        readonly $: '$',
        readonly ['$.1:a']: '$.1:a',
        readonly ['$.1:b']: '$.1:b',
        readonly ['$.2:x']: '$.2:x',
        readonly ['$.2:y']: '$.2:y',
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
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

    let t: {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('nullable', function () {
    const builder = nullable(list(nullable(list(numberType))))

    type T = SimplifyDeep<ValueToTypePathsOfType<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
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
