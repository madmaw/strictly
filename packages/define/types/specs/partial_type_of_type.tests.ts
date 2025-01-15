import { type SimplifyDeep } from 'type-fest'
import {
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type PartialTypeOfType } from 'types/partial_type_of_type'

describe('PartialTypeDefOf', function () {
  describe('literal', function () {
    type T = PartialTypeOfType<typeof numberType._type>

    let t: {
      readonly typeDef: {
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
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(numberType)
    type T = PartialTypeOfType<typeof builder._type>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.List,
            readonly elements: {
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
            },
          },
          readonly [1]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [null],
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('record', function () {
    const builder = record<typeof numberType, 'a' | 'b'>(numberType)
    type T = SimplifyDeep<PartialTypeOfType<typeof builder._type>>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Record,
            readonly keyPrototype: 'a' | 'b',
            readonly valueTypeDef: {
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
            } | undefined,
          },
          readonly [1]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [null],
          },
        },
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('object', function () {
    const builder = object()
      .field('a', numberType)
      .readonlyField('b', stringType)
    type T = PartialTypeOfType<typeof builder._type>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Object,
            readonly fields: {
              a?: {
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
              },
              readonly b?: {
                readonly type: TypeDefType.Union,
                readonly discriminator: null,
                readonly unions: {
                  readonly [0]: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: [string],
                  },
                  readonly [1]: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: [null],
                  },
                },
              },
            },
          },
          readonly [1]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [null],
          },
        },
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    describe('simple', function () {
      const builder = union()
        .or('1', numberType)
        .or('2', stringType)
      type T = PartialTypeOfType<typeof builder._type>

      let t: {
        readonly typeDef: {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions: {
            readonly [0]: {
              readonly type: TypeDefType.Union,
              readonly discriminator: null,
              readonly unions: {
                readonly [1]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: [number],
                },
                readonly [2]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: [string],
                },
              },
            },
            readonly [1]: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [null],
            },
          },
        },
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('readonly', function () {
    const builder = list(numberType).readonly()
    type T = PartialTypeOfType<typeof builder._type>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.List,
            readonly elements: {
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
            },
          },
          readonly [1]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [null],
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})
