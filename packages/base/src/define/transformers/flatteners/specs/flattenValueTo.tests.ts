import {
  type AnyValueType,
  flattenValueTo,
  type Mapper,
  type Setter,
} from 'define/transformers/flatteners/flattenValueTo'
import {
  booleanType,
  list,
  literal,
  nullType,
  numberType,
  object,
  record,
  union,
} from 'define/types/builders'
import { type FlattenedTypesOfType } from 'define/types/FlattenedTypesOfType'
import { type Type } from 'define/types/Type'
import { type ValueOfType } from 'define/types/ValueOfType'
import { type Mock, vi } from 'vite-plus/test'

type FlattenedSetters<R extends Record<string, Type>> = {
  [K in keyof R]: Setter<ValueOfType<R[K]>>
}

type FlattenedToStrings<R extends Record<string, Type>> = {
  [K in keyof R]: string
}

describe('flattenValueTo', () => {
  let toStringMapper: Mock<Mapper<string>>
  let setMapper: Mock<Mapper<(v: AnyValueType) => void>>
  let setter: Mock<(v: AnyValueType) => void>
  beforeEach(() => {
    toStringMapper = vi.fn((_t: Type, v: AnyValueType) => JSON.stringify(v))
    setMapper = vi.fn(
      (_t: Type, _v: AnyValueType, setter: Setter<AnyValueType>) => setter,
    )
    setter = vi.fn()
  })

  describe('literal', () => {
    const type = numberType.narrow
    type F = FlattenedTypesOfType<typeof type, null>
    describe('toString', () => {
      let flattened: FlattenedToStrings<F>
      beforeEach(() => {
        flattened = flattenValueTo(type, 1, setter, toStringMapper)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: '1',
        })
      })

      it('calls the mapping function', () => {
        expect(toStringMapper).toHaveBeenCalledTimes(1)
      })
    })

    describe('setter', () => {
      let flattened: FlattenedSetters<F>
      beforeEach(() => {
        flattened = flattenValueTo(type, 1, setter, setMapper)
      })

      it('calls the top level setter', () => {
        const value = 3
        flattened.$(value)
        expect(setter).toHaveBeenCalledTimes(1)
        expect(setter).toHaveBeenCalledWith(value)
      })
    })
  })

  describe('list', () => {
    const type = list(numberType).narrow
    type F = FlattenedTypesOfType<typeof type, null>
    let l: ValueOfType<typeof type>
    beforeEach(() => {
      l = [1, 2, 3]
    })

    describe('toString', () => {
      let flattened: FlattenedToStrings<F>
      beforeEach(() => {
        flattened = flattenValueTo(type, l, setter, toStringMapper)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: '[1,2,3]',
          ['$.0']: '1',
          ['$.1']: '2',
          ['$.2']: '3',
        })
      })

      it('calls the mapping function', () => {
        expect(toStringMapper).toHaveBeenCalledTimes(4)
      })
    })

    describe('setter', () => {
      let flattened: FlattenedSetters<F>
      beforeEach(() => {
        flattened = flattenValueTo(type, l, setter, setMapper)
      })

      it('sets a value in the list', () => {
        flattened['$.1'](4)
        expect(l).toEqual([1, 4, 3])
      })
    })
  })

  describe('record', () => {
    const type = record<typeof numberType, 'a' | 'b'>(numberType).narrow
    type F = FlattenedTypesOfType<typeof type, null>

    let m: ValueOfType<typeof type>
    beforeEach(() => {
      m = {
        a: 1,
        b: 3,
      }
    })

    describe('toString', () => {
      let flattened: FlattenedToStrings<F>
      beforeEach(() => {
        flattened = flattenValueTo(type, m, setter, toStringMapper)
      })

      it('equals expected type', () => {
        expect(flattened).toEqual({
          $: '{"a":1,"b":3}',
          ['$.a']: '1',
          ['$.b']: '3',
        })
      })
    })

    describe('setter', () => {
      let flattened: FlattenedSetters<F>
      beforeEach(() => {
        flattened = flattenValueTo(type, m, setter, setMapper)
      })

      it('sets a value in the record', () => {
        flattened['$.a'](4)
        expect(m).toEqual({
          a: 4,
          b: 3,
        })
      })
    })
  })

  describe('object', () => {
    describe('mandatory fields', () => {
      const type = object()
        .field('a', numberType)
        .field('b', booleanType).narrow
      type F = FlattenedTypesOfType<typeof type, null>

      let s: ValueOfType<typeof type>
      beforeEach(() => {
        s = {
          a: 1,
          b: false,
        }
      })

      describe('toString', () => {
        let flattened: FlattenedToStrings<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, s, setter, toStringMapper)
        })

        it('equals expected type', () => {
          expect(flattened).toEqual({
            $: '{"a":1,"b":false}',
            ['$.a']: '1',
            ['$.b']: 'false',
          })
        })
      })

      describe('setter', () => {
        let flattened: FlattenedSetters<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, s, setter, setMapper)
        })

        it('sets "a" in the object', () => {
          flattened['$.a'](2)
          expect(s).toEqual({
            a: 2,
            b: false,
          })
        })

        it('sets "b" in the object', () => {
          flattened['$.b'](true)
          expect(s).toEqual({
            a: 1,
            b: true,
          })
        })
      })
    })

    describe('nested optional field', () => {
      const type = object().optionalField(
        'a',
        object().optionalField('b', numberType),
      ).narrow
      type F = FlattenedTypesOfType<typeof type, null>

      describe('empty', () => {
        let s: ValueOfType<typeof type>
        beforeEach(() => {
          s = {}
        })

        describe('toString', () => {
          let flattened: FlattenedToStrings<F>
          beforeEach(() => {
            flattened = flattenValueTo(type, s, setter, toStringMapper)
          })

          it('maps the missing field but not its children', () => {
            expect(flattened).toEqual({
              $: '{}',
              '$.a': undefined,
            })
            expect(Object.keys(flattened).sort()).toEqual(['$', '$.a'])
          })
        })
      })

      describe('populated', () => {
        let s: ValueOfType<typeof type>
        beforeEach(() => {
          s = { a: { b: 2 } }
        })

        describe('toString', () => {
          let flattened: FlattenedToStrings<F>
          beforeEach(() => {
            flattened = flattenValueTo(type, s, setter, toStringMapper)
          })

          it('flattens through the optional wrappers', () => {
            expect(flattened).toEqual({
              $: '{"a":{"b":2}}',
              '$.a': '{"b":2}',
              '$.a.b': '2',
            })
          })
        })

        describe('setter', () => {
          let flattened: FlattenedSetters<F>
          beforeEach(() => {
            flattened = flattenValueTo(type, s, setter, setMapper)
          })

          it('sets a nested optional value', () => {
            flattened['$.a.b'](3)
            expect(s).toEqual({ a: { b: 3 } })
          })
        })
      })
    })
  })

  describe('union', () => {
    describe('discriminated', () => {
      const type = union('d')
        .or('1', object().field('a', numberType))
        .or('2', object().field('b', booleanType)).narrow
      type F = FlattenedTypesOfType<typeof type, null>
      let u: ValueOfType<typeof type>
      beforeEach(() => {
        u = {
          d: '1',
          a: 2,
        }
      })

      describe('toString', () => {
        let flattened: FlattenedToStrings<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, u, setter, toStringMapper)
        })

        it('equals expected type', () => {
          expect(flattened).toEqual({
            $: '{"d":"1","a":2}',
            ['$:1.a']: '2',
            ['$:1.d']: '"1"',
          })
        })
      })

      describe('setter', () => {
        let flattened: FlattenedSetters<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, u, setter, setMapper)
        })

        it('sets a value', () => {
          const value = {
            d: '2',
            b: false,
          } as const
          flattened.$(value)

          expect(setter).toHaveBeenCalledWith(value)
        })

        it('sets an internal value', () => {
          flattened['$:1.a'](1)

          expect(u).toEqual({
            d: '1',
            a: 1,
          })
        })
      })
    })
    describe('non-discriminated', () => {
      const type = union().or('0', numberType).or('1', nullType).narrow
      type F = FlattenedTypesOfType<typeof type, null>
      let u: ValueOfType<typeof type>

      beforeEach(() => {
        u = null
      })

      describe('toString', () => {
        let flattened: FlattenedToStrings<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, u, setter, toStringMapper)
        })

        it('equals expected type', () => {
          expect(flattened).toEqual({
            $: 'null',
          })
        })
      })

      describe('setter', () => {
        let flattened: FlattenedSetters<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, u, setter, setMapper)
        })

        it('sets a value', () => {
          const value = 2
          flattened.$(value)

          expect(setter).toHaveBeenCalledWith(value)
        })
      })
    })

    describe('complex non-discriminated', () => {
      const type = union()
        .or('z', list(numberType))
        .or('x', nullType)
        .or('y', literal([false])).narrow
      type F = FlattenedTypesOfType<typeof type, null>

      let u: ValueOfType<typeof type>
      beforeEach(() => {
        u = [1, 2, 3]
      })

      describe('toString', () => {
        let flattened: FlattenedToStrings<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, u, setter, toStringMapper)
        })

        it('equals expected type', () => {
          expect(flattened).toEqual({
            $: '[1,2,3]',
            ['$.0']: '1',
            ['$.1']: '2',
            ['$.2']: '3',
          })
        })
      })

      describe('setter', () => {
        let flattened: FlattenedSetters<F>
        beforeEach(() => {
          flattened = flattenValueTo(type, u, setter, setMapper)
        })

        it('sets the top level value', () => {
          const value = [100]
          flattened.$(value)
          expect(setter).toHaveBeenCalledWith(value)
        })

        it('sets a subordinate value', () => {
          flattened['$.1'](4)
          expect(u).toEqual([1, 4, 3])
        })
      })
    })
  })
})
