import { type SimplifyDeep } from 'type-fest'
import {
  list,
  number,
  object,
  record,
  string,
  union,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type PartialTypeDefOf } from 'types/partial_type_def_of'

describe('PartialTypeDefOf', function () {
  describe('literal', function () {
    type T = PartialTypeDefOf<typeof number>

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
    const builder = list(number)
    type T = PartialTypeDefOf<typeof builder>

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
    const builder = record<typeof number, 'a' | 'b'>(number)
    type T = SimplifyDeep<PartialTypeDefOf<typeof builder>>

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
      .set('a', number)
      .setReadonly('b', string)
    type T = PartialTypeDefOf<typeof builder>

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
        .add('1', number)
        .add('2', string)
      type T = PartialTypeDefOf<typeof builder>

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
    const builder = list(number).readonly()
    type T = PartialTypeDefOf<typeof builder>

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
