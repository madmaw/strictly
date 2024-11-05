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
    type T = FlattenedTypeDefsOf<typeof number, 's'>

    let t: {
      readonly $: {
        readonly type: TypeDefType.Literal,
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
        readonly type: TypeDefType.List,
        elements: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: number,
        },
      },
      readonly ['$.s']: {
        readonly type: TypeDefType.Literal,
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
        readonly type: TypeDefType.Map,
        readonly keyPrototype: 'a' | 'b',
        valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: number,
        },
      },
      readonly ['$.s']: {
        readonly type: TypeDefType.Literal,
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
          readonly type: TypeDefType.Structured,
          readonly fields: {
            a: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
            b?: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: string,
            },
            readonly c: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: boolean,
            },
            readonly d?: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: string,
            },
          },
        },
        readonly ['$.a']: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: number,
        },
        readonly ['$.b']: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: string,
        },
        readonly ['$.c']: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: boolean,
        },
        readonly ['$.d']: {
          readonly type: TypeDefType.Literal,
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
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions: {
            readonly [1]: {
              readonly type: TypeDefType.Structured,
              readonly fields: {
                a: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: boolean,
                },
              },
            },
            readonly [2]: {
              readonly type: TypeDefType.Structured,
              readonly fields: {
                a: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: number,
                },
              },
            },
          },
        },
        readonly ['$.a']: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: boolean,
        },
      }
      | {
        readonly $: {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions: {
            readonly [1]: {
              readonly type: TypeDefType.Structured,
              readonly fields: {
                a: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: boolean,
                },
              },
            },
            readonly [2]: {
              readonly type: TypeDefType.Structured,
              readonly fields: {
                a: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: number,
                },
              },
            },
          },
        },
        readonly ['$.a']: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: number,
        },
      }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  // describe('infinite recursion', function () {
  //   function f<T extends TypeDefHolder>({ typeDef }: T): FlattenedTypeDefsOf<T, null> {
  //     return {
  //       $: typeDef
  //     }
  //   }
  //   it('compiles', function () {
  //     const builder = list(string)

  //     expect(f(builder)).toBeDefined();
  //   })    
  // })

})

