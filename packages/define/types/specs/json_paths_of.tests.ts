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
import { type JsonPathsOf } from 'types/json_paths_of'

describe('JsonPathsOf', function () {
  describe('literal', function () {
    let path: '$'

    describe('regular', function () {
      type T = JsonPathsOf<typeof stringType>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(stringType)
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('list', function () {
    let path: '$' | `$.${number}`

    describe('mutable', function () {
      const builder = list(stringType)
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const builder = list(stringType).readonly()
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(list(stringType))
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const builder = list(stringType)
      type T = JsonPathsOf<typeof builder, 'o'>

      let path: '$' | `$.o`
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('record', function () {
    let path: '$' | `$.${string}` | `$.${number}`

    describe('mutable', function () {
      const builder = record(stringType)
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('mutable with exact keys', function () {
      const builder = record<typeof stringType, 'a' | 'b'>(stringType)
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.a' | '$.b'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('mutable with numeric keys', function () {
      const builder = record<typeof stringType, 1 | 2 | 3>(stringType)
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.1' | '$.2' | '$.3'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const builder = record(stringType).readonly()
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('partial', function () {
      const builder = record(stringType).partial()
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(record(stringType))
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const builder = record(stringType)
      type T = JsonPathsOf<typeof builder, 'x'>

      let path: '$' | '$.x'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('object', function () {
    describe('simple', function () {
      const builder = object()
        .set('n', numberType)
        .set('b', booleanType)
        .set('s', stringType)
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.n' | '$.b' | '$.s'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
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
        type T = JsonPathsOf<typeof builder, 'y'>
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const builder = object()
        .set('s1', object().set('a1', booleanType))
        .set('s2', object().set('a2', stringType))
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.s1' | '$.s1.a1' | '$.s2' | '$.s2.a2'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('object of list', function () {
      const builder = object()
        .set('l', list(numberType))

      describe('no override', function () {
        type T = JsonPathsOf<typeof builder>

        let path: '$' | '$.l' | `$.l.${number}`
        it('equals expected type', function () {
          expectTypeOf(path).toEqualTypeOf<T>()
        })
      })

      describe('passes override', function () {
        type T = JsonPathsOf<typeof builder, 'o'>

        let path: '$' | '$.l' | '$.l.o'
        it('equals expected type', function () {
          expectTypeOf(path).toEqualTypeOf<T>()
        })
      })
    })
  })

  describe('union', function () {
    describe('with primitives', function () {
      const builder = union()
        .add('1', numberType)
        .add('2', stringType)
      type T = JsonPathsOf<typeof builder>

      let path: '$'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('with overlapping record', function () {
      const builder = union()
        .add('1', object().set('a', numberType).set('b', stringType))
        .add('2', object().set('b', stringType).set('c', stringType))
        .add('3', object().set('c', stringType).set('a', stringType))
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.a' | '$.b' | '$.c'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const builder = union()
        .add('1', object().set(
          'a',
          union().add('x', object().set('aa', stringType)),
        ))
        .add('2', object().set(
          'b',
          union().add('y', object().set('bb', stringType)),
        ))
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.a' | '$.a.aa' | '$.b' | '$.b.bb'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('with discriminator', function () {
    const builder = union('x')
      .add('1', object().set('a', booleanType))
      .add('2', object().set('b', numberType))

    type T = JsonPathsOf<typeof builder>

    let path: '$' | '$.1:a' | '$.2:b'

    it('equals expected type', function () {
      expectTypeOf(path).toEqualTypeOf<T>()
    })
  })

  describe('with nested discriminator', function () {
    const builder = union('x')
      .add(
        '1',
        union('y').add('p', object().set('a', booleanType)),
      )
      .add(
        '2',
        union('z').add('q', object().set('b', numberType)),
      )

    type T = JsonPathsOf<typeof builder>

    let path: '$' | '$.1:p:a' | '$.2:q:b'

    it('equals expected type', function () {
      expectTypeOf(path).toEqualTypeOf<T>()
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
