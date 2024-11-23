import { type SimplifyDeep } from 'type-fest'
import {
  boolean,
  list,
  map,
  number,
  string,
  struct,
  union,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type FlattenedTypeDefsOf } from 'types/flattened_type_defs_of'

describe('FlattenedTypeDefsOf', function () {
  describe('literal', function () {
    type T = FlattenedTypeDefsOf<typeof number, null>

    let t: {
      readonly $: {
        readonly typeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(number)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, '*'>>

    let t: {
      readonly $: SimplifyDeep<typeof builder.narrow>,
      readonly ['$.*']: {
        readonly typeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const builder = map<typeof number, 'a' | 'b'>(number)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, '*'>>

    let t: {
      readonly $: SimplifyDeep<typeof builder.narrow>,
      readonly ['$.*']: {
        readonly typeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf<typeof t>(t).toEqualTypeOf<T>()
    })
  })

  describe('struct', function () {
    describe('simple', function () {
      const builder = struct()
        .set('a', number)
        .setOptional('b', string)
        .setReadonly('c', boolean)
        .setReadonlyOptional('d', string)
      type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
        readonly ['$.a']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
        readonly ['$.b']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
        readonly ['$.c']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.d']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })
})

describe('union', function () {
  describe('overlapping', function () {
    describe('non-discriminated', function () {
      const builder = union()
        .add('x', struct().set('a', boolean))
        .add('y', struct().set('b', number))
      type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
        readonly ['$.a']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.b']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('discriminated', function () {
      const builder = union('x')
        .add('1', struct().set('a', boolean))
        .add('2', struct().set('a', number))
      type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
        readonly ['$.1:a']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.2:a']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('nested discriminated', function () {
      const builder = union('x')
        .add(
          '1',
          union('y')
            .add('p', struct().set('a', boolean))
            .add('q', struct().set('a', string)),
        )
        .add(
          '2',
          union('z')
            .add('r', struct().set('b', number))
            .add('s', struct().set('c', string)),
        )
      type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, null>>
      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
        readonly ['$.1:p:a']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.1:q:a']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
        readonly ['$.2:r:b']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
        readonly ['$.2:s:c']: {
          readonly typeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })
})
