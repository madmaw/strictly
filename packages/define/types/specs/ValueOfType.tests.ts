import { type SimplifyDeep } from 'type-fest'
import {
  type TypeDefType,
} from 'types/Definitions'
import { type ValueOfType } from 'types/ValueOfType'

describe('ValueOfType', function () {
  describe('literal', function () {
    type TypeD = {
      readonly type: TypeDefType.Literal,
      readonly valuePrototype: ['a' | 'b' | 'c'],
    }
    type T = ValueOfType<{ definition: TypeD }>

    type C = 'a' | 'b' | 'c'
    it('equals expected type', function () {
      expectTypeOf<C>().toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    describe('simple', function () {
      type TypeD = {
        readonly type: TypeDefType.List,
        elements: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a' | 'b' | 'c'],
        },
      }
      type T = ValueOfType<{ definition: TypeD }>
      describe('mutable', function () {
        type C = ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf<C>().toEqualTypeOf<T>()
        })
      })

      describe('readonly', function () {
        type R = ValueOfType<{
          definition: {
            readonly type: TypeDefType.List,
            readonly elements: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: ['a' | 'b' | 'c'],
            },
          },
        }>

        type C = readonly ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf<C>().toEqualTypeOf<R>()
        })
      })
    })
  })

  describe('record', function () {
    type TypeD = {
      readonly type: TypeDefType.Record,
      readonly keyPrototype: 'x' | 'y' | 'z',
      valueTypeDef: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: ['a' | 'b' | 'c'],
      },
    }
    type T = ValueOfType<{ definition: TypeD }>

    describe('mutable', function () {
      type C = Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      type R = ValueOfType<{
        readonly definition: {
          readonly type: TypeDefType.Record,
          readonly keyPrototype: 'x' | 'y' | 'z',
          readonly valueTypeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: ['a' | 'b' | 'c'],
          },
        },
      }>
      type C = Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<R>()
      })
    })

    describe('partial', function () {
      type TypeD = {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'x' | 'y' | 'z',
        valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a' | 'b' | 'c'],
        } | undefined,
      }
      type T = ValueOfType<{ definition: TypeD }>

      type C = Partial<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('partial readonly', function () {
      type TypeD = {
        readonly type: TypeDefType.Record,
        readonly keyPrototype: 'x' | 'y' | 'z',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a' | 'b' | 'c'],
        } | undefined,
      }
      type T = ValueOfType<{ definition: TypeD }>

      type C = Partial<Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>>
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('object', function () {
    type TypeD = {
      readonly type: TypeDefType.Object,
      fields: {
        a: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a' | 'b'],
        },
        b: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    type T = ValueOfType<{ definition: TypeD }>

    describe('mutable', function () {
      type C = {
        a: 'a' | 'b',
        b: number,
      }

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      type TypeD = {
        readonly type: TypeDefType.Object,
        fields: {
          readonly a: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: ['a' | 'b'],
          },
          readonly b: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }
      type T = ValueOfType<{ definition: TypeD }>

      type C = {
        readonly a: 'a' | 'b',
        readonly b: number,
      }
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('partial', function () {
      type TypeD = {
        readonly type: TypeDefType.Object,
        readonly fields: {
          a?: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: ['a' | 'b'],
          },
          b?: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }
      type T = ValueOfType<{ definition: TypeD }>

      type C = {
        a?: 'a' | 'b',
        b?: number,
      }

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      type T = ValueOfType<{
        definition: {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions: {
            readonly [0]: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: [null],
            },
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
      }>

      type C = null | number | string

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('implicitly discriminated', function () {
      type T = ValueOfType<{
        definition: {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions: {
            readonly [0]: {
              readonly type: TypeDefType.Object,
              readonly fields: {
                b: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: [string],
                },
                readonly d: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: [1],
                },
              },
            },
            readonly [1]: {
              readonly type: TypeDefType.Object,
              readonly fields: {
                b: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: [number],
                },
                readonly d: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: [2],
                },
              },
            },
          },
        },
      }>

      type C = {
        readonly d: 1,
        b: string,
      } | {
        readonly d: 2,
        b: number,
      }

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('explicitly discriminated', function () {
      type T = SimplifyDeep<
        ValueOfType<{
          definition: {
            readonly type: TypeDefType.Union,
            readonly discriminator: 'd',
            readonly unions: {
              readonly [1]: {
                readonly type: TypeDefType.Object,
                readonly fields: {
                  b: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: [string],
                  },
                },
              },
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
          },
        }>
      >

      type C = {
        readonly d: 1,
        b: string,
      } | {
        readonly d: 2,
        b: number,
      }

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })
})
