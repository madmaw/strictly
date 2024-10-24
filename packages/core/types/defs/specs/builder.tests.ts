import {
  boolean,
  list,
  map,
  number,
  partial,
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
            readonly elements: {
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
          readonly toReadonlyTypeDef: {
            readonly elements: {
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
        const { typeDef } = map<'a' | 'b' | 'c', typeof number.typeDef>(number)

        it('equals expected type', function () {
          type C = {
            readonly keyPrototype: 'a' | 'b' | 'c',
            readonly valueTypeDef: {
              readonly valuePrototype: number,
            },
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('readonly', function () {
        const { typeDef } = readonly(map<'a' | 'b' | 'c', typeof number.typeDef>(number))

        it('equals expected type', function () {
          type C = {
            readonly toReadonlyTypeDef: {
              readonly keyPrototype: 'a' | 'b' | 'c',
              readonly valueTypeDef: {
                readonly valuePrototype: number,
              },
            },
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('partial', function () {
        const { typeDef } = partial(map<'a' | 'b' | 'c', typeof number.typeDef>(number))

        it('equals expected type', function () {
          type C = {
            readonly toPartialTypeDef: {
              readonly keyPrototype: 'a' | 'b' | 'c',
              readonly valueTypeDef: {
                readonly valuePrototype: number,
              },
            },
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
        readonly fields:
          & {
            a: {
              readonly valuePrototype: number,
            },
          }
          & {
            readonly b: {
              readonly valuePrototype: boolean,
            },
          }
          & {
            c?: {
              readonly valuePrototype: string,
            },
          }
          & {
            readonly d?: {
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
          readonly unions:
            & {
              readonly [1]: {
                readonly valuePrototype: number,
              },
            }
            & {
              readonly [2]: {
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
          readonly unions:
            & {
              readonly [1]: {
                readonly fields: {
                  a: {
                    readonly valuePrototype: boolean,
                  },
                },
              },
            }
            & {
              readonly [2]: {
                readonly fields: {
                  b: {
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
