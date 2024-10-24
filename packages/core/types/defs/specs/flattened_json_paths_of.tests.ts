import { type SimplifyDeep } from 'type-fest'
import {
  boolean,
  list,
  map,
  nullable,
  number,
  partial,
  readonly,
  string,
  struct,
  union,
} from 'types/defs/builders'
import { type FlattenedJsonPathsOf } from 'types/defs/flattened_json_paths_of'

describe('FlattenedJsonPathsOf', function () {
  describe('literal', function () {
    const { typeDef } = number
    type T = FlattenedJsonPathsOf<typeof typeDef>

    let t: {
      readonly $: '$',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const { typeDef } = list(list(number))
    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.@',
      readonly [_: `$[${number}][${number}]`]: '$.@.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const l = list(number)
    const { typeDef } = map<'a' | 'b', typeof l.typeDef>(l)
    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
      readonly [`$.a`]: '$.@',
      readonly [`$.b`]: '$.@',
      readonly [_: `$.a[${number}]`]: '$.@.@',
      readonly [_: `$.b[${number}]`]: '$.@.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('struct', function () {
    const { typeDef } = struct()
      .set('a', list(number))
      .set('b', boolean)
    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
      readonly [`$.a`]: '$.a',
      readonly [`$.b`]: '$.b',
      readonly [_: `$.a[${number}]`]: '$.a.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    const { typeDef } = union()
      .add(1, list(number))
      .add(2, string)
    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
    } | {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('readonly', function () {
    const { typeDef } = readonly(list(list(number)))

    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.@',
      readonly [_: `$[${number}][${number}]`]: '$.@.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('partial', function () {
    const l = list(number)
    const { typeDef } = partial(map<'a' | 'b', typeof l.typeDef>(l))
    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
      readonly [`$.a`]: '$.@',
      readonly [`$.b`]: '$.@',
      readonly [_: `$.a[${number}]`]: '$.@.@',
      readonly [_: `$.b[${number}]`]: '$.@.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('nullable', function () {
    const { typeDef } = nullable(list(nullable(list(number))))

    type T = SimplifyDeep<FlattenedJsonPathsOf<typeof typeDef>>

    let t: {
      readonly $: '$',
      readonly [_: `$[${number}]`]: '$.@',
      readonly [_: `$[${number}][${number}]`]: '$.@.@',
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})
