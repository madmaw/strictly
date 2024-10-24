import { type ValueTypeOf } from 'types/defs/value_type_of'
import { type ReadonlyRecord } from 'util/record'

describe('ValueTypeOf', function () {
  describe('literal', function () {
    type TypeD = {
      valuePrototype: 'a' | 'b' | 'c',
    }
    type T = ValueTypeOf<TypeD>

    let t: 'a' | 'b' | 'c'
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })

    describe('nullable', function () {
      type N = ValueTypeOf<{
        toNullableTypeDef: TypeD,
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
        elements: {
          valuePrototype: 'a' | 'b' | 'c',
        },
      }
      type T = ValueTypeOf<TypeD>
      describe('mutable', function () {
        let a: ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf(a).toEqualTypeOf<T>()
        })
      })

      describe('readonly', function () {
        type R = ValueTypeOf<{
          toReadonlyTypeDef: TypeD,
        }>

        let a: readonly ('a' | 'b' | 'c')[]
        it('equals expected type', function () {
          expectTypeOf(a).toEqualTypeOf<R>()
        })
      })

      describe('nullable', function () {
        type N = ValueTypeOf<{
          toNullableTypeDef: TypeD,
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
      keyPrototype: 'x' | 'y' | 'z',
      valueTypeDef: {
        valuePrototype: 'a' | 'b' | 'c',
      },
    }
    type T = ValueTypeOf<TypeD>

    describe('mutable', function () {
      let t: Record<'x' | 'y' | 'z', 'a' | 'b' | 'c'>
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      type R = ValueTypeOf<{
        toReadonlyTypeDef: TypeD,
      }>
      let r: ReadonlyRecord<'x' | 'y' | 'z', 'a' | 'b' | 'c'>

      it('equals expected type', function () {
        expectTypeOf(r).toEqualTypeOf<R>()
      })
    })
  })

  describe('struct', function () {
    type TypeD = {
      fields: {
        a: {
          valuePrototype: 'a' | 'b',
        },
        b: {
          valuePrototype: number,
        },
      },
    }
    type T = ValueTypeOf<TypeD>

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
        fields: {
          readonly a: {
            valuePrototype: 'a' | 'b',
          },
          readonly b: {
            valuePrototype: number,
          },
        },
      }
      type T = ValueTypeOf<TypeD>

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
        fields: {
          a?: {
            valuePrototype: 'a' | 'b',
          },
          b?: {
            valuePrototype: number,
          },
        },
      }
      type T = ValueTypeOf<TypeD>

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
      unions: {
        [0]: {
          fields: {
            b: {
              valuePrototype: string,
            },
            readonly d: {
              valuePrototype: 1,
            },
          },
        },
        [1]: {
          fields: {
            e: {
              valuePrototype: number,
            },
            readonly d: {
              valuePrototype: 2,
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
