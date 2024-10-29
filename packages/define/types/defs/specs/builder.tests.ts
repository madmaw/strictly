import { type TypeDefType } from 'types/defs'
import {
  boolean,
  list,
  map,
  number,
  readonly,
  string,
  struct,
  union,
} from 'types/defs/builders'

describe('builder', function () {
  describe('literal', function () {
    const { typeDef } = number

    it('equals expected type', function () {
      type C = {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: number,
      }

      expectTypeOf(typeDef).toEqualTypeOf<C>()
    })
  })

  describe('list', function () {
    describe('numeric list', function () {
      describe('mutable', function () {
        const { typeDef } = list(number)

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.List,
            readonly elements: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })

    describe('readonly', function () {
      const { typeDef } = readonly(list(number))

      it('equals expected type', function () {
        type C = {
          readonly type: TypeDefType.Readonly,
          readonly toReadonlyTypeDef: {
            readonly type: TypeDefType.List,
            readonly elements: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
          },
        }

        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })
  })

  describe('map', function () {
    describe('numeric map', function () {
      describe('mutable', function () {
        const { typeDef } = map<'a' | 'b' | 'c', typeof number>(number)

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Map,
            readonly keyPrototype: 'a' | 'b' | 'c',
            readonly partial: false,
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('readonly', function () {
        const { typeDef } = readonly(map<'a' | 'b' | 'c', typeof number>(number))

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Readonly,
            readonly toReadonlyTypeDef: {
              readonly type: TypeDefType.Map,
              readonly keyPrototype: 'a' | 'b' | 'c',
              readonly partial: false,
              readonly valueTypeDef: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: number,
              },
            },
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('partial', function () {
        const { typeDef } = map<'a' | 'b' | 'c', typeof number>(number).partial()

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Map,
            readonly keyPrototype: 'a' | 'b' | 'c',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
            readonly partial: true,
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })
  })

  describe('struct', function () {
    const { typeDef } = struct()
      .set('a', number)
      .setReadonly('b', boolean)
      .setOptional('c', string)
      .setReadonlyOptional('d', number)

    it('equals expected type', function () {
      type C = {
        readonly type: TypeDefType.Structured,
        readonly fields:
          & {
            a: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
          }
          & {
            readonly b: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: boolean,
            },
          }
          & {
            c?: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: string,
            },
          }
          & {
            readonly d?: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: number,
            },
          },
      }

      expectTypeOf(typeDef).toEqualTypeOf<C>()
    })
  })

  describe('union', function () {
    describe('literals', function () {
      const {
        typeDef,
      } = union()
        .add(
          1,
          number,
        )
        .add(
          2,
          string,
        )

      it('equals expected type', function () {
        type C = {
          readonly type: TypeDefType.Union,
          readonly unions:
            & {
              readonly [1]: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: number,
              },
            }
            & {
              readonly [2]: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: string,
              },
            },
        }
        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })

    describe('structs', function () {
      const {
        typeDef,
      } = union()
        .add(
          1,
          struct().set('a', boolean),
        )
        .add(
          2,
          struct().set('b', number),
        )

      it('equals expected type', function () {
        type C = {
          readonly type: TypeDefType.Union,
          readonly unions:
            & {
              readonly [1]: {
                readonly type: TypeDefType.Structured,
                readonly fields: {
                  a: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: boolean,
                  },
                },
              },
            }
            & {
              readonly [2]: {
                readonly type: TypeDefType.Structured,
                readonly fields: {
                  b: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: number,
                  },
                },
              },
            },
        }
        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })
  })
})
