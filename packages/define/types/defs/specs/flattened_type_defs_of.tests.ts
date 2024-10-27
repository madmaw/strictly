import { type SimplifyDeep } from 'type-fest'
import {
  boolean,
  list,
  map,
  number,
  string,
  struct,
  union,
} from 'types/defs/builders'
import { type FlattenedTypeDefsOf } from 'types/defs/flattened_type_defs_of'

describe('FlattenedTypeDefsOf', function () {
  describe('literal', function () {
    type T = FlattenedTypeDefsOf<typeof number, 's'>

    let t: {
      readonly $: {
        readonly valuePrototype: number,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(number)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, 's'>>

    let t: {
      readonly $: {
        readonly elements: {
          readonly valuePrototype: number,
        },
      },
      readonly ['$.s']: {
        readonly valuePrototype: number,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const builder = map<'a' | 'b', typeof number>(number)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, 's'>>

    let t: {
      readonly $: {
        readonly keyPrototype: 'a' | 'b',
        readonly valueTypeDef: {
          readonly valuePrototype: number,
        },
      },
      readonly ['$.s']: {
        readonly valuePrototype: number,
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('struct', function () {
    describe('simple', function () {
      const builder = struct()
        .set('a', number)
        .setOptional('b', string)
        .setReadonly('c', boolean)
        .setReadonlyOptional('d', string)
      type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, '@'>>

      let t: {
        readonly $: {
          readonly fields: {
            a: {
              readonly valuePrototype: number,
            },
            b?: {
              readonly valuePrototype: string,
            },
            readonly c: {
              readonly valuePrototype: boolean,
            },
            readonly d?: {
              readonly valuePrototype: string,
            },
          },
        },
        readonly ['$.a']: {
          readonly valuePrototype: number,
        },
        readonly ['$.b']: {
          readonly valuePrototype: string,
        },
        readonly ['$.c']: {
          readonly valuePrototype: boolean,
        },
        readonly ['$.d']: {
          readonly valuePrototype: string,
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
    const builder = union()
      .add(1, struct().set('a', boolean))
      .add(2, struct().set('a', number))
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof builder, 's'>>

    let t:
      | {
        readonly $: {
          readonly unions: {
            readonly [1]: {
              readonly fields: {
                a: {
                  readonly valuePrototype: boolean,
                },
              },
            },
            readonly [2]: {
              readonly fields: {
                a: {
                  readonly valuePrototype: number,
                },
              },
            },
          },
        },
        readonly ['$.a']: {
          readonly valuePrototype: boolean,
        },
      }
      | {
        readonly $: {
          readonly unions: {
            readonly [1]: {
              readonly fields: {
                a: {
                  readonly valuePrototype: boolean,
                },
              },
            },
            readonly [2]: {
              readonly fields: {
                a: {
                  readonly valuePrototype: number,
                },
              },
            },
          },
        },
        readonly ['$.a']: {
          readonly valuePrototype: number,
        },
      }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})
