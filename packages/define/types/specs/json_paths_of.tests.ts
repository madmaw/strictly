import {
  boolean,
  list,
  map,
  nullable,
  number,
  string,
  struct,
  union,
} from 'types/builders'
import { type JsonPathsOf } from 'types/json_paths_of'

describe('JsonPathsOf', function () {
  describe('literal', function () {
    let path: '$'

    describe('regular', function () {
      type T = JsonPathsOf<typeof string>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(string)
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('list', function () {
    let path: '$' | `$.${number}`

    describe('mutable', function () {
      const builder = list(string)
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const builder = list(string).readonly()
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(list(string))
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const builder = list(string)
      type T = JsonPathsOf<typeof builder, 'o'>

      let path: '$' | `$.o`
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('map', function () {
    let path: '$' | `$.${string}` | `$.${number}`

    describe('mutable', function () {
      const builder = map(string)
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('mutable with exact keys', function () {
      const builder = map<typeof string, 'a' | 'b'>(string)
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.a' | '$.b'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('mutable with numeric keys', function () {
      const builder = map<typeof string, 1 | 2 | 3>(string)
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.1' | '$.2' | '$.3'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const builder = map(string).readonly()
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('partial', function () {
      const builder = map(string).partial()
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const builder = nullable(map(string))
      type T = JsonPathsOf<typeof builder>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const builder = map(string)
      type T = JsonPathsOf<typeof builder, 'x'>

      let path: '$' | '$.x'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('struct', function () {
    describe('simple', function () {
      const builder = struct()
        .set('n', number)
        .set('b', boolean)
        .set('s', string)
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.n' | '$.b' | '$.s'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })

      it('can be used in a map', function () {
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
      const builder = struct()
        .set('s1', struct().set('a1', boolean))
        .set('s2', struct().set('a2', string))
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.s1' | '$.s1.a1' | '$.s2' | '$.s2.a2'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('struct of list', function () {
      const builder = struct()
        .set('l', list(number))

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
        .add('1', number)
        .add('2', string)
      type T = JsonPathsOf<typeof builder>

      let path: '$'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('with overlapping map', function () {
      const builder = union()
        .add('1', struct().set('a', number).set('b', string))
        .add('2', struct().set('b', string).set('c', string))
        .add('3', struct().set('c', string).set('a', string))
      type T = JsonPathsOf<typeof builder>

      let path: '$' | '$.a' | '$.b' | '$.c'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const builder = union()
        .add('1', struct().set(
          'a',
          union().add('x', struct().set('aa', string)),
        ))
        .add('2', struct().set(
          'b',
          union().add('y', struct().set('bb', string)),
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
      .add('1', struct().set('a', boolean))
      .add('2', struct().set('b', number))

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
        union('y').add('p', struct().set('a', boolean)),
      )
      .add(
        '2',
        union('z').add('q', struct().set('b', number)),
      )

    type T = JsonPathsOf<typeof builder>

    let path: '$' | '$.1:p:a' | '$.2:q:b'

    it('equals expected type', function () {
      expectTypeOf(path).toEqualTypeOf<T>()
    })
  })

  // breaks linting
  // describe('infinite recursion', function () {
  //   function f<T extends TypeDefHolder>(t: T): JsonPathsOf<T> {
  //     return JSON.stringify(t) as JsonPathsOf<T>
  //   }
  //   it('compiles', function () {
  //     const builder = list(string)

  //     expect(f(builder)).toBeDefined();
  //   })
  // })
})
