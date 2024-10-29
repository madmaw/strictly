import {
  type TypeDefType,
} from 'types/defs'
import { type ValueTypeOf } from 'types/defs/value_type_of'
import { type ReadonlyRecord } from 'util/record'

describe('ValueTypeOf', function () {
  describe('literal', function () {
    type TypeD = {
      readonly type: TypeDefType.Literal,
      readonly valuePrototype: 'a' | 'b' | 'c',
    }
    type T = ValueTypeOf<{ typeDef: TypeD }>

    let t: 'a' | 'b' | 'c'
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })

    describe('nullable', function () {
      type N = ValueTypeOf<{
        readonly typeDef: {
          readonly type: TypeDefType.Nullable,
          readonly toNullableTypeDef: TypeD,
        },
      }>
      let n: 'a' | 'b' | 'c' | null

      it('equals expected type', function () {
        expectTypeOf(n).toEqualTypeOf<N>()
      })
    })
  })

  describe('list', function () {
    describe('simple', function () {
      type TypeD = {
        readonly type: TypeDefType.List,
        readonly elements: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: 'a' | 'b' | 'c',
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
          readonly typeDef: {
            readonly type: TypeDefType.Readonly,
            readonly toReadonlyTypeDef: TypeD,
          },
        }>

        let a: readonly ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf(a).toEqualTypeOf<R>()
        })
      })

      describe('nullable', function () {
        type N = ValueTypeOf<{
          readonly typeDef: {
            readonly type: TypeDefType.Nullable,
            readonly toNullableTypeDef: TypeD,
          },
        }>
        let a: ('a' | 'b' | 'c')[] | null

        it('equals expected type', function () {
          expectTypeOf(a).toEqualTypeOf<N>()
        })
      })
    })
  })

  describe('map', function () {
    type TypeD = {
      readonly type: TypeDefType.Map,
      readonly keyPrototype: 'x' | 'y' | 'z',
      readonly valueTypeDef: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: 'a' | 'b' | 'c',
      },
      readonly partial: false,
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
          readonly type: TypeDefType.Readonly,
          readonly toReadonlyTypeDef: TypeD,
        },
      }>
      let r: ReadonlyRecord<'x' | 'y' | 'z', 'a' | 'b' | 'c'>

      it('equals expected type', function () {
        expectTypeOf(r).toEqualTypeOf<R>()
      })
    })

    describe('partial', function () {
      type TypeD = {
        readonly type: TypeDefType.Map,
        readonly keyPrototype: 'x' | 'y' | 'z',
        readonly valueTypeDef: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: 'a' | 'b' | 'c',
        } | undefined,
      }
      type T = ValueTypeOf<{ typeDef: TypeD }>

      let t: Partial<Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>>
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('struct', function () {
    type TypeD = {
      readonly type: TypeDefType.Structured,
      fields: {
        a: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: 'a' | 'b',
        },
        b: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: number,
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
        readonly type: TypeDefType.Structured,
        fields: {
          readonly a: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: 'a' | 'b',
          },
          readonly b: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
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
        readonly type: TypeDefType.Structured,
        readonly fields: {
          a?: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: 'a' | 'b',
          },
          b?: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
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
    type T = ValueTypeOf<{
      typeDef: {
        readonly type: TypeDefType.Union,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Structured,
            readonly fields: {
              b: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: string,
              },
              readonly d: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: 1,
              },
            },
          },
          readonly [1]: {
            readonly type: TypeDefType.Structured,
            readonly fields: {
              e: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: number,
              },
              readonly d: {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: 2,
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
      e: number,
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})
