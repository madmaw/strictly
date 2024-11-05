import { type SimplifyDeep } from 'type-fest'
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
      readonly [_: `$[${number}]`]: '$.*',
      readonly [_: `$[${number}][${number}]`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const l = list(number)
    const builder = map<'a' | 'b', typeof l>(l)
    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [`$.a`]: '$.*',
      readonly [`$.b`]: '$.*',
      readonly [_: `$.a[${number}]`]: '$.*.*',
      readonly [_: `$.b[${number}]`]: '$.*.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
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
      readonly [_: `$.a[${number}]`]: '$.a.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    const builder = union()
      .add('1', list(number))
      .add('2', string)
    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

    let t: {
      readonly $: '$',
    } | {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.*',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('readonly', function () {
    const builder = list(list(number)).readonly()

    type T = SimplifyDeep<FlattenedJsonValueToTypePathsOf<typeof builder>>

    let t: {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.*',
      readonly [_: `$[${number}][${number}]`]: '$.*.*',
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
      readonly [_: `$[${number}]`]: '$.*',
      readonly [_: `$[${number}][${number}]`]: '$.*.*',
    } | {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.*',
    } | {
      readonly $: '$',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})
