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
    const { typeDef } = number
    type T = FlattenedTypeDefsOf<typeof typeDef, 's'>

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
    const { typeDef } = list(number)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof typeDef, 's'>>

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
    const { typeDef } = map<'a' | 'b', typeof number.typeDef>(number)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof typeDef, 's'>>

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
    const { typeDef } = struct()
      .set('a', number)
      .set('b', string)
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof typeDef, 's'>>

    let t: {
      readonly $: {
        readonly fields: {
          a: {
            readonly valuePrototype: number,
          },
          b: {
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
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})

describe('union', function () {
  describe('overlapping', function () {
    const { typeDef } = union()
      .add(1, struct().set('a', boolean))
      .add(2, struct().set('a', number))
    type T = SimplifyDeep<FlattenedTypeDefsOf<typeof typeDef, 's'>>

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
