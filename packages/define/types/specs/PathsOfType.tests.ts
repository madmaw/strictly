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
import { type PathsOfType } from 'types/PathsOfType'

describe('PathsOfType', function () {
  describe('literal', function () {
    type P = '$'

    describe('regular', function () {
      type T = PathsOfType<typeof stringType>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(stringType)
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('list', function () {
    type P = '$' | `$.${number}`

    describe('mutable', function () {
      const builder = list(stringType)
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const builder = list(stringType).readonly()
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(list(stringType))
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const builder = list(stringType)
      type T = PathsOfType<typeof builder, 'o'>

      type P = '$' | `$.o`
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('record', function () {
    type P = '$' | `$.${string}` | `$.${number}`

    describe('mutable', function () {
      const builder = record(stringType)
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('mutable with exact keys', function () {
      const builder = record<typeof stringType, 'a' | 'b'>(stringType)
      type T = PathsOfType<typeof builder>

      type P = '$' | '$.a' | '$.b'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('mutable with numeric keys', function () {
      const builder = record<typeof stringType, 1 | 2 | 3>(stringType)
      type T = PathsOfType<typeof builder>

      type P = '$' | '$.1' | '$.2' | '$.3'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const builder = record(stringType).readonly()
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('partial', function () {
      const builder = record(stringType).partialKeys()
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(record(stringType))
      type T = PathsOfType<typeof builder>

      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const builder = record(stringType)
      type T = PathsOfType<typeof builder, 'x'>

      type P = '$' | '$.x'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('object', function () {
    describe('simple', function () {
      const builder = object()
        .field('n', numberType)
        .field('b', booleanType)
        .field('s', stringType)
      type T = PathsOfType<typeof builder>

      type P = '$' | '$.n' | '$.b' | '$.s'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })

      it('can be used in a record', function () {
        // using our types in a map has previously caused TSC to crash or
        // complain about infinitely deep types
        type M = Record<T, string>

        expectTypeOf({
          ['$']: 's1',
          ['$.n']: 's2',
          ['$.b']: 's3',
          ['$.s']: 's4',
        }).toEqualTypeOf<M>()
      })

      it('ignores override', function () {
        type T = PathsOfType<typeof builder, 'y'>
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const builder = object()
        .field('s1', object().field('a1', booleanType))
        .field('s2', object().field('a2', stringType))
      type T = PathsOfType<typeof builder>

      type P = '$' | '$.s1' | '$.s1.a1' | '$.s2' | '$.s2.a2'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('object of list', function () {
      const builder = object()
        .field('l', list(numberType))

      describe('no override', function () {
        type T = PathsOfType<typeof builder>

        type P = '$' | '$.l' | `$.l.${number}`
        it('equals expected type', function () {
          expectTypeOf<P>().toEqualTypeOf<T>()
        })
      })

      describe('passes override', function () {
        type T = PathsOfType<typeof builder, 'o'>

        type P = '$' | '$.l' | '$.l.o'
        it('equals expected type', function () {
          expectTypeOf<P>().toEqualTypeOf<T>()
        })
      })
    })
  })

  describe('union', function () {
    describe('with primitives', function () {
      const builder = union()
        .or('1', numberType)
        .or('2', stringType)
      type T = PathsOfType<typeof builder>

      type P = '$'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('with overlapping record', function () {
      const builder = union()
        .or('1', object().field('a', numberType).field('b', stringType))
        .or('2', object().field('b', stringType).field('c', stringType))
        .or('3', object().field('c', stringType).field('a', stringType))
      type T = PathsOfType<typeof builder>

      type P = '$' | '$.a' | '$.b' | '$.c'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const builder = union()
        .or('1', object().field(
          'a',
          union().or('x', object().field('aa', stringType)),
        ))
        .or('2', object().field(
          'b',
          union().or('y', object().field('bb', stringType)),
        ))
      type T = PathsOfType<typeof builder>

      type P = '$' | '$.a' | '$.a.aa' | '$.b' | '$.b.bb'
      it('equals expected type', function () {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('with discriminator', function () {
    const builder = union('x')
      .or('1', object().field('a', booleanType))
      .or('2', object().field('b', numberType))

    type T = PathsOfType<typeof builder>

    type P = '$' | '$:1.a' | '$:2.b'

    it('equals expected type', function () {
      expectTypeOf<P>().toEqualTypeOf<T>()
    })
  })

  describe('with nested discriminator', function () {
    const builder = union('x')
      .or(
        '1',
        union('y').or('p', object().field('a', booleanType)),
      )
      .or(
        '2',
        union('z').or('q', object().field('b', numberType)),
      )

    type T = PathsOfType<typeof builder>

    type P = '$' | '$:1:p.a' | '$:2:q.b'

    it('equals expected type', function () {
      expectTypeOf<P>().toEqualTypeOf<T>()
    })
  })

  // breaks linting
  // describe('infinite recursion', function () {
  //   function f<T extends Type>(t: T): JsonPathsOf<T> {
  //     return JSON.stringify(t) as JsonPathsOf<T>
  //   }
  //   it('compiles', function () {
  //     const builder = list(string)

  //     expect(f(builder)).toBeDefined();
  //   })
  // })
})
