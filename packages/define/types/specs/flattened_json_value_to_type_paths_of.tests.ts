import {
  type SimplifyDeep,
  type ValueOf,
} from 'type-fest'
import {
  boolean,
  list,
  map,
  nullable,
  number,
  string,
  struct,
  union,
} from 'types/builders'
import { type FlattenedJsonValueToTypePathsOf } from 'types/flattened_json_value_to_type_paths_of'
import { type FlattenedTypeDefsOf } from 'types/flattened_type_defs_of'

describe('FlattenedJsonPathsOf', function () {
  describe('literal', function () {
    type T = FlattenedJsonValueToTypePathsOf<typeof number>

    let t: {
      readonly $: '$',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(list(number))
    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const l = list(number)
    const builder = map<typeof l, 'a' | 'b'>(l)
    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

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

  describe('struct', function () {
    const builder = struct()
      .set('a', list(number))
      .setOptional('b', boolean)
      .setReadonly('c', string)
      .setReadonlyOptional('d', string)
    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

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
      type ValuePaths = keyof FlattenedTypeDefsOf<typeof builder, null>
      expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
    })

    it('has the same type paths', function () {
      type TypePaths = keyof FlattenedTypeDefsOf<typeof builder, '*'>
      expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      const builder = union()
        .add('1', list(number))
        .add('2', string)
      type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

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
        .add('1', struct().set('a', boolean).set('b', number))
        .add('2', struct().set('x', number).set('y', string))
      type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

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
        type ValuePaths = keyof FlattenedTypeDefsOf<typeof builder, null>
        expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
      })

      it('has the same type paths', function () {
        type TypePaths = keyof FlattenedTypeDefsOf<typeof builder, '*'>
        expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
      })
    })
  })

  describe('readonly', function () {
    const builder = list(list(number)).readonly()

    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

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
    const builder = nullable(list(nullable(list(number))))

    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [_: `$.${number}`]: '$.*',
      readonly [_: `$.${number}.${number}`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })

    it('has the same value paths', function () {
      type ValuePaths = keyof FlattenedTypeDefsOf<typeof builder, null>
      expectTypeOf<ValuePaths>().toEqualTypeOf<keyof T>()
    })

    it('has the same type paths', function () {
      type TypePaths = keyof FlattenedTypeDefsOf<typeof builder, '*'>
      expectTypeOf<TypePaths>().toEqualTypeOf<ValueOf<T>>()
    })
  })
})
