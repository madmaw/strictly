import {
  boolean,
  list,
  map,
  nullable,
  number,
  partial,
  readonly,
  string,
  struct,
  union,
} from 'types/defs/builders'
import { type JsonPathsOf } from 'types/defs/json_paths_of'

describe('JsonPathsOf', function () {
  describe('literal', function () {
    let path: '$'

    describe('regular', function () {
      const { typeDef } = string
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const { typeDef } = nullable(string)
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('list', function () {
    let path: '$' | `$[${number}]`

    describe('mutable', function () {
      const { typeDef } = list(string)
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const { typeDef } = readonly(list(string))
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const { typeDef } = nullable(list(string))
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const { typeDef } = list(string)
      type T = JsonPathsOf<typeof typeDef, 'o'>

      let path: '$' | `$.o`
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('map', function () {
    let path: '$' | `$.${string}` | `$[${number}]`

    describe('mutable', function () {
      const { typeDef } = map(string)
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('mutable with exact keys', function () {
      const { typeDef } = map<'a' | 'b', typeof string.typeDef>(string)
      type T = JsonPathsOf<typeof typeDef>

      let path: '$' | '$.a' | '$.b'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('mutable with numeric keys', function () {
      const { typeDef } = map<1 | 2 | 3, typeof string.typeDef>(string)
      type T = JsonPathsOf<typeof typeDef>

      let path: '$' | '$[1]' | '$[2]' | '$[3]'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('readonly', function () {
      const { typeDef } = readonly(map(string))
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('partial', function () {
      const { typeDef } = partial(map(string))
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nullable', function () {
      const { typeDef } = nullable(map(string))
      type T = JsonPathsOf<typeof typeDef>

      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('override', function () {
      const { typeDef } = map(string)
      type T = JsonPathsOf<typeof typeDef, 'x'>

      let path: '$' | '$.x'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })

  describe('struct', function () {
    describe('simple', function () {
      const { typeDef } = struct()
        .set('n', number)
        .set('b', boolean)
        .set('s', string)
      type T = JsonPathsOf<typeof typeDef>

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
        type T = JsonPathsOf<typeof typeDef, 'y'>
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const { typeDef } = struct()
        .set('s1', struct().set('a1', boolean))
        .set('s2', struct().set('a2', string))
      type T = JsonPathsOf<typeof typeDef>

      let path: '$' | '$.s1' | '$.s1.a1' | '$.s2' | '$.s2.a2'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('struct of list', function () {
      const { typeDef } = struct()
        .set('l', list(number))

      describe('no override', function () {
        type T = JsonPathsOf<typeof typeDef>

        let path: '$' | '$.l' | `$.l[${number}]`
        it('equals expected type', function () {
          expectTypeOf(path).toEqualTypeOf<T>()
        })
      })

      describe('passes override', function () {
        type T = JsonPathsOf<typeof typeDef, 'o'>

        let path: '$' | '$.l' | '$.l.o'
        it('equals expected type', function () {
          expectTypeOf(path).toEqualTypeOf<T>()
        })
      })
    })
  })

  describe('union', function () {
    describe('with primitives', function () {
      const { typeDef } = union()
        .add(1, number)
        .add(2, string)
      type T = JsonPathsOf<typeof typeDef>

      let path: '$'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('with overlapping map', function () {
      const { typeDef } = union()
        .add(1, struct().set('a', number).set('b', string))
        .add(2, struct().set('b', string).set('c', string))
        .add(3, struct().set('c', string).set('a', string))
      type T = JsonPathsOf<typeof typeDef>

      let path: '$' | '$.a' | '$.b' | '$.c'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })

    describe('nested', function () {
      const { typeDef } = union()
        .add(1, struct().set(
          'a',
          union().add('x', struct().set('aa', string)),
        ))
        .add(2, struct().set(
          'b',
          union().add('y', struct().set('bb', string)),
        ))
      type T = JsonPathsOf<typeof typeDef>

      let path: '$' | '$.a' | '$.a.aa' | '$.b' | '$.b.bb'
      it('equals expected type', function () {
        expectTypeOf(path).toEqualTypeOf<T>()
      })
    })
  })
})
