import {
  type AnyValueType,
  flattenValueTypeTo,
  type Mapper,
  type Setter,
} from 'transformers/flatteners/flatten_value_type_to'
import { type SimplifyDeep } from 'type-fest'
import {
  boolean,
  list,
  literal,
  map,
  nullTypeDefHolder,
  number,
  struct,
  union,
} from 'types/builders'
import {
  type TypeDef,
  type TypeDefHolder,
} from 'types/definitions'
import { type FlattenedTypeDefsOf } from 'types/flattened_type_defs_of'
import { type ValueTypeOf } from 'types/value_type_of'
import {
  type Mock,
  vi,
} from 'vitest'

type FlattenedSetters<R extends Record<string, TypeDefHolder>> = {
  [K in keyof R]: Setter<ValueTypeOf<R[K]>>
}

type FlattenedToStrings<R extends Record<string, TypeDefHolder>> = {
  [K in keyof R]: string
}

describe('flattenValueTypeTo', function () {
  let toStringMapper: Mock<Mapper<string>>
  let setMapper: Mock<Mapper<(v: AnyValueType) => void>>
  let setter: Mock<(v: AnyValueType) => void>
  beforeEach(function () {
    toStringMapper = vi.fn(function (_t: TypeDef, v: AnyValueType) {
      return JSON.stringify(v)
    })
    setMapper = vi.fn(function (_t: TypeDef, _v: AnyValueType, setter: Setter<AnyValueType>) {
      return setter
    })
    setter = vi.fn()
  })

  describe('literal', function () {
    const typeDef = number
    type F = FlattenedTypeDefsOf<typeof typeDef, null>
    describe('toString', function () {
      let flattened: FlattenedToStrings<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          1,
          setter,
          toStringMapper,
        )
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: '1',
        })
      })

      it('calls the mapping function', function () {
        expect(toStringMapper).toHaveBeenCalledTimes(1)
      })
    })

    describe('setter', function () {
      let flattened: FlattenedSetters<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          1,
          setter,
          setMapper,
        )
      })

      it('calls the top level setter', function () {
        const value = 3
        flattened.$(value)
        expect(setter).toHaveBeenCalledTimes(1)
        expect(setter).toHaveBeenCalledWith(value)
      })
    })
  })

  describe('list', function () {
    const typeDef = list(number)
    type F = FlattenedTypeDefsOf<typeof typeDef, null>
    let l: ValueTypeOf<typeof typeDef>
    beforeEach(function () {
      l = [
        1,
        2,
        3,
      ]
    })

    describe('toString', function () {
      let flattened: FlattenedToStrings<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          l,
          setter,
          toStringMapper,
        )
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: '[1,2,3]',
          ['$[0]']: '1',
          ['$[1]']: '2',
          ['$[2]']: '3',
        })
      })

      it('calls the mapping function', function () {
        expect(toStringMapper).toHaveBeenCalledTimes(4)
      })
    })

    describe('setter', function () {
      let flattened: FlattenedSetters<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          l,
          setter,
          setMapper,
        )
      })

      it('sets a value in the list', function () {
        flattened['$[1]'](4)
        expect(l).toEqual([
          1,
          4,
          3,
        ])
      })
    })
  })

  describe('map', function () {
    const typeDef = map<'a' | 'b', typeof number>(number)
    type F = FlattenedTypeDefsOf<typeof typeDef, null>

    let m: ValueTypeOf<typeof typeDef>
    beforeEach(function () {
      m = {
        a: 1,
        b: 3,
      }
    })

    describe('toString', function () {
      let flattened: FlattenedToStrings<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          m,
          setter,
          toStringMapper,
        )
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: '{"a":1,"b":3}',
          ['$.a']: '1',
          ['$.b']: '3',
        })
      })
    })

    describe('setter', function () {
      let flattened: FlattenedSetters<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          m,
          setter,
          setMapper,
        )
      })

      it('sets a value in the map', function () {
        flattened['$.a'](4)
        expect(m).toEqual({
          a: 4,
          b: 3,
        })
      })
    })
  })

  describe('struct', function () {
    const typeDef = struct()
      .set('a', number)
      .set('b', boolean)
    type F = FlattenedTypeDefsOf<typeof typeDef, null>

    let s: ValueTypeOf<typeof typeDef>
    beforeEach(function () {
      s = {
        a: 1,
        b: false,
      }
    })

    describe('toString', function () {
      let flattened: FlattenedToStrings<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          s,
          setter,
          toStringMapper,
        )
      })

      it('equals expected type', function () {
        expect(flattened).toEqual({
          $: '{"a":1,"b":false}',
          ['$.a']: '1',
          ['$.b']: 'false',
        })
      })
    })

    describe('setter', function () {
      let flattened: FlattenedSetters<F>
      beforeEach(function () {
        flattened = flattenValueTypeTo(
          typeDef,
          s,
          setter,
          setMapper,
        )
      })

      it('sets "a" in the struct', function () {
        flattened['$.a'](2)
        expect(s).toEqual({
          a: 2,
          b: false,
        })
      })

      it('sets "b" in the struct', function () {
        flattened['$.b'](true)
        expect(s).toEqual({
          a: 1,
          b: true,
        })
      })
    })
  })

  describe('union', function () {
    describe('discriminated', function () {
      const typeDef = union('d')
        .add('1', struct().set('a', number))
        .add('2', struct().set('b', boolean))
      type F = SimplifyDeep<FlattenedTypeDefsOf<typeof typeDef, null>>
      let u: ValueTypeOf<typeof typeDef>
      beforeEach(function () {
        u = {
          d: '1',
          a: 2,
        }
      })

      describe('toString', function () {
        let flattened: FlattenedToStrings<F>
        beforeEach(function () {
          flattened = flattenValueTypeTo(
            typeDef,
            u,
            setter,
            toStringMapper,
          )
        })

        it('equals expected type', function () {
          expect(flattened).toEqual({
            $: '{"d":"1","a":2}',
            ['$.1:a']: '2',
          })
        })
      })

      describe('setter', function () {
        type G = SimplifyDeep<FlattenedSetters<F>>
        let flattened: G
        beforeEach(function () {
          flattened = flattenValueTypeTo(
            typeDef,
            u,
            setter,
            setMapper,
          )
        })

        it('sets a value', function () {
          const value = {
            d: '2',
            b: false,
          } as const
          flattened.$(value)

          expect(setter).toHaveBeenCalledWith(value)
        })

        it('sets an internal value', function () {
          flattened['$.1:a'](1)

          expect(u).toEqual({
            d: '1',
            a: 1,
          })
        })
      })
    })
    describe('non-discriminated', function () {
      const typeDef = union()
        .add('0', number)
        .add('1', nullTypeDefHolder)
      type F = FlattenedTypeDefsOf<typeof typeDef, null>
      let u: ValueTypeOf<typeof typeDef>

      beforeEach(function () {
        u = null
      })

      describe('toString', function () {
        let flattened: FlattenedToStrings<F>
        beforeEach(function () {
          flattened = flattenValueTypeTo(
            typeDef,
            u,
            setter,
            toStringMapper,
          )
        })

        it('equals expected type', function () {
          expect(flattened).toEqual({
            $: 'null',
          })
        })
      })

      describe('setter', function () {
        let flattened: FlattenedSetters<F>
        beforeEach(function () {
          flattened = flattenValueTypeTo(
            typeDef,
            u,
            setter,
            setMapper,
          )
        })

        it('sets a value', function () {
          const value = 2
          flattened.$(value)

          expect(setter).toHaveBeenCalledWith(value)
        })
      })
    })

    describe('complex non-discriminated', function () {
      const typeDef = union()
        .add('z', list(number))
        .add('x', nullTypeDefHolder)
        .add('y', literal([false]))
      type F = FlattenedTypeDefsOf<typeof typeDef, null>

      let u: ValueTypeOf<typeof typeDef>
      beforeEach(function () {
        u = [
          1,
          2,
          3,
        ]
      })

      describe('toString', function () {
        let flattened: FlattenedToStrings<F>
        beforeEach(function () {
          flattened = flattenValueTypeTo(
            typeDef,
            u,
            setter,
            toStringMapper,
          )
        })

        it('equals expected type', function () {
          expect(flattened).toEqual({
            $: '[1,2,3]',
            ['$[0]']: '1',
            ['$[1]']: '2',
            ['$[2]']: '3',
          })
        })
      })

      describe('setter', function () {
        let flattened: FlattenedSetters<F>
        beforeEach(function () {
          flattened = flattenValueTypeTo(
            typeDef,
            u,
            setter,
            setMapper,
          )
        })

        it('sets the top level value', function () {
          const value = [100]
          flattened.$(value)
          expect(setter).toHaveBeenCalledWith(value)
        })

        it('sets a subordinate value', function () {
          // need to cast to any as TS cannot guarantee that '$.a' is present
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
          ;(flattened as any)['$[1]'](4)
          expect(u).toEqual([
            1,
            4,
            3,
          ])
        })
      })
    })
  })
})
