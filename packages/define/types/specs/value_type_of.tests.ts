import { type SimplifyDeep } from 'type-fest'
import {
  type TypeDefType,
} from 'types/definitions'
import { type ValueTypeOf } from 'types/value_type_of'

describe('ValueTypeOf', function () {
  describe('literal', function () {
    type TypeD = {
      readonly type: TypeDefType.Literal,
      readonly valuePrototype: ['a' | 'b' | 'c'],
    }
    type T = ValueTypeOf<{ typeDef: TypeD }>

    let t: 'a' | 'b' | 'c'
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
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
      type T = ValueTypeOf<{ typeDef: TypeD }>
      describe('mutable', function () {
        let a: ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf(a).toEqualTypeOf<T>()
        })
      })

      describe('readonly', function () {
        type R = ValueTypeOf<{
          typeDef: {
            readonly type: TypeDefType.List,
            readonly elements: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: ['a' | 'b' | 'c'],
            },
          },
        }>

        let a: readonly ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf(a).toEqualTypeOf<R>()
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
    type T = ValueTypeOf<{ typeDef: TypeD }>

    describe('mutable', function () {
      let t: Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      type R = ValueTypeOf<{
        readonly typeDef: {
          readonly type: TypeDefType.Record,
          readonly keyPrototype: 'x' | 'y' | 'z',
          readonly valueTypeDef: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: ['a' | 'b' | 'c'],
          },
        },
      }>
      let r: Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>

      it('equals expected type', function () {
        expectTypeOf(r).toEqualTypeOf<R>()
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
      type T = ValueTypeOf<{ typeDef: TypeD }>

      let t: Partial<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
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
      type T = ValueTypeOf<{ typeDef: TypeD }>

      let t: Partial<Readonly<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>>
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
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
    type T = ValueTypeOf<{ typeDef: TypeD }>

    describe('mutable', function () {
      let value: {
        a: 'a' | 'b',
        b: number,
      }

      it('equals expected type', function () {
        expectTypeOf(value).toEqualTypeOf<T>()
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
      type T = ValueTypeOf<{ typeDef: TypeD }>

      let value: {
        readonly a: 'a' | 'b',
        readonly b: number,
      }
      it('equals expected type', function () {
        expectTypeOf(value).toEqualTypeOf<T>()
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
      type T = ValueTypeOf<{ typeDef: TypeD }>

      let v: {
        a?: 'a' | 'b',
        b?: number,
      }

      it('equals expected type', function () {
        expectTypeOf(v).toEqualTypeOf<T>()
      })
    })
  })

  describe('union', function () {
    describe('non-discriminated', function () {
      type T = ValueTypeOf<{
        typeDef: {
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

      let t: null | number | string

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('implicitly discriminated', function () {
      type T = ValueTypeOf<{
        typeDef: {
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

      let t: {
        readonly d: 1,
        b: string,
      } | {
        readonly d: 2,
        b: number,
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('explicitly discriminated', function () {
      type T = SimplifyDeep<
        ValueTypeOf<{
          typeDef: {
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

      let t: {
        readonly d: 1,
        b: string,
      } | {
        readonly d: 2,
        b: number,
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })
})
