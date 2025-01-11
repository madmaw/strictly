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
import {
  type TypeDefType,
} from 'types/definitions'

describe('builder', function () {
  describe('literal', function () {
    const { definition: typeDef } = numberType

    it('equals expected type', function () {
      type C = {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: [number],
      }

      expectTypeOf(typeDef).toEqualTypeOf<C>()
    })

    describe('nullable', function () {
      const { definition: typeDef } = nullable(numberType)

      type C = {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
          readonly [1]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [null],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })
  })

  describe('list', function () {
    describe('numeric list', function () {
      describe('mutable', function () {
        const { definition: typeDef } = list(numberType)

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.List,
            elements: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            },
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })

    describe('readonly', function () {
      const { definition: typeDef } = list(numberType).readonly()

      it('equals expected type', function () {
        type C = {
          readonly type: TypeDefType.List,
          readonly elements: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        }

        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })
  })

  describe('record', function () {
    describe('numeric record', function () {
      describe('mutable', function () {
        const { definition: typeDef } = record<typeof numberType, 'a' | 'b' | 'c'>(numberType)

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a' | 'b' | 'c',
            valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            },
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('readonly', function () {
        const { definition: typeDef } = record<typeof numberType, 'a' | 'b' | 'c'>(numberType).readonly()

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a' | 'b' | 'c',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            },
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('partial', function () {
        const { definition: typeDef } = record<typeof numberType, 'a' | 'b' | 'c'>(numberType).partial()

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a' | 'b' | 'c',
            valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            } | undefined,
          }
          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('partial readonly', function () {
        const { definition: typeDef } = record<typeof numberType, 'a' | 'b' | 'c'>(numberType).partial().readonly()

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a' | 'b' | 'c',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            } | undefined,
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })

      describe('readonly partial', function () {
        const { definition: typeDef } = record<typeof numberType, 'a' | 'b' | 'c'>(numberType).readonly().partial()

        it('equals expected type', function () {
          type C = {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a' | 'b' | 'c',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            } | undefined,
          }

          expectTypeOf(typeDef).toEqualTypeOf<C>()
        })
      })
    })
  })

  describe('object', function () {
    const { definition: typeDef } = object()
      .field('a', numberType)
      .readonlyField('b', booleanType)
      .optionalField('c', stringType)
      .readonlyOptionalField('d', numberType)

    it('equals expected type', function () {
      type C = {
        readonly type: TypeDefType.Object,
        readonly fields:
          & {
            a: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            },
          }
          & {
            readonly b: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [boolean],
            },
          }
          & {
            c?: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [string],
            },
          }
          & {
            readonly d?: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [number],
            },
          },
      }

      expectTypeOf(typeDef).toEqualTypeOf<C>()
    })
  })

  describe('union', function () {
    describe('literals', function () {
      const {
        definition: typeDef,
      } = union()
        .or(
          '1',
          numberType,
        )
        .or(
          '2',
          stringType,
        )

      it('equals expected type', function () {
        type C = {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions:
            & {
              readonly [1]: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [number],
              },
            }
            & {
              readonly [2]: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [string],
              },
            },
        }
        expectTypeOf(typeDef).toEqualTypeOf<C>()
      })
    })

    describe('objects', function () {
      const {
        definition: typeDef,
      } = union()
        .or(
          '1',
          object().field('a', booleanType),
        )
        .or(
          '2',
          object().field('b', numberType),
        )

      it('equals expected type', function () {
        type C = {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions:
            & {
              readonly [1]: {
                readonly type: TypeDefType.Object,
                readonly fields: {
                  a: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: [boolean],
                  },
                },
              },
            }
            & {
              readonly [2]: {
                readonly type: TypeDefType.Object,
                readonly fields: {
                  b: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: [number],
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
