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

describe('PathsOfType', () => {
  describe('literal', () => {
    type P = '$'

    describe('regular', () => {
      type T = PathsOfType<typeof stringType.narrow>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nullable', () => {
      const t = nullable(stringType).narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('list', () => {
    type P = '$' | `$.${number}`

    describe('mutable', () => {
      const t = list(stringType).narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('readonly', () => {
      const t = list(stringType).readonlyElements().narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nullable', () => {
      const t = nullable(list(stringType)).narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('override', () => {
      const t = list(stringType).narrow
      type T = PathsOfType<typeof t, 'o'>

      type P = '$' | '$.o'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('record', () => {
    type P = '$' | `$.${string}`

    describe('mutable', () => {
      const t = record(stringType).narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('mutable with exact keys', () => {
      const t = record<typeof stringType, 'a' | 'b'>(stringType).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.a' | '$.b'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('mutable with numeric keys', () => {
      const t = record<typeof stringType, 1 | 2 | 3>(stringType).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.1' | '$.2' | '$.3'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('readonly', () => {
      const t = record(stringType).readonlyKeys().narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('partial', () => {
      const t = record(stringType).partialKeys().narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nullable', () => {
      const t = nullable(record(stringType)).narrow
      type T = PathsOfType<typeof t>

      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('override', () => {
      const t = record(stringType).narrow
      type T = PathsOfType<typeof t, 'x'>

      type P = '$' | '$.x'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('object', () => {
    describe('simple', () => {
      const t = object()
        .field('n', numberType)
        .field('b', booleanType)
        .field('s', stringType).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.n' | '$.b' | '$.s'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })

      it('can be used in a record', () => {
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

      it('ignores override', () => {
        type T = PathsOfType<typeof t, 'y'>
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nested', () => {
      const t = object()
        .field('s1', object().field('a1', booleanType))
        .field('s2', object().field('a2', stringType)).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.s1' | '$.s1.a1' | '$.s2' | '$.s2.a2'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('optional and readonly fields', () => {
      const t = object()
        .optionalField('o', object().field('a', numberType))
        .readonlyField('r', list(numberType)).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.o' | '$.o.a' | '$.r' | `$.r.${number}`
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('object of list', () => {
      const t = object().field('l', list(numberType)).narrow

      describe('no override', () => {
        type T = PathsOfType<typeof t>

        type P = '$' | '$.l' | `$.l.${number}`
        it('equals expected type', () => {
          expectTypeOf<P>().toEqualTypeOf<T>()
        })
      })

      describe('passes override', () => {
        type T = PathsOfType<typeof t, 'o'>

        type P = '$' | '$.l' | '$.l.o'
        it('equals expected type', () => {
          expectTypeOf<P>().toEqualTypeOf<T>()
        })
      })
    })
  })

  describe('union', () => {
    describe('with primitives', () => {
      const t = union().or('1', numberType).or('2', stringType).narrow
      type T = PathsOfType<typeof t>

      type P = '$'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('with overlapping record', () => {
      const t = union()
        .or('1', object().field('a', numberType).field('b', stringType))
        .or('2', object().field('b', stringType).field('c', stringType))
        .or('3', object().field('c', stringType).field('a', stringType)).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.a' | '$.b' | '$.c'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })

    describe('nested', () => {
      const t = union()
        .or(
          '1',
          object().field(
            'a',
            union().or('x', object().field('aa', stringType)),
          ),
        )
        .or(
          '2',
          object().field(
            'b',
            union().or('y', object().field('bb', stringType)),
          ),
        ).narrow
      type T = PathsOfType<typeof t>

      type P = '$' | '$.a' | '$.a.aa' | '$.b' | '$.b.bb'
      it('equals expected type', () => {
        expectTypeOf<P>().toEqualTypeOf<T>()
      })
    })
  })

  describe('with discriminator', () => {
    const t = union('x')
      .or('1', object().field('a', booleanType))
      .or('2', object().field('b', numberType)).narrow

    type T = PathsOfType<typeof t>

    type P = '$' | '$:1.a' | '$:1.x' | '$:2.b' | '$:2.x'

    it('equals expected type', () => {
      expectTypeOf<P>().toEqualTypeOf<T>()
    })
  })
})
