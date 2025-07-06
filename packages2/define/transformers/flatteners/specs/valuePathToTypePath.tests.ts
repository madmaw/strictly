import { valuePathToTypePath } from 'transformers/flatteners/valuePathToTypePath'
import {
  booleanType,
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'

describe('valuePathToTypePath', function () {
  describe('literal', function () {
    const typeDef = numberType
    type Paths = ValueToTypePathsOfType<typeof typeDef>

    const typePath = valuePathToTypePath<Paths, '$'>(typeDef, '$')

    it('maps a value path to the expected type path', function () {
      expect(typePath).toEqual('$')
    })

    it('has expected type', function () {
      expectTypeOf(typePath).toEqualTypeOf<'$'>()
    })

    describe('fake subpath', function () {
      const fakeTypePath = valuePathToTypePath<{
        '$.fake': '$.fake',
      }, '$.fake'>(typeDef, '$.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
      })
    })
  })

  describe('list', function () {
    const typeDef = list(numberType)
    type Paths = ValueToTypePathsOfType<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$.0',
        '$.*',
      ],
    ] as const)('it maps "%s"', function (from, to) {
      const typePath = valuePathToTypePath<Paths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake subpath', function () {
      const fakeTypePath = valuePathToTypePath<
        Paths & {
          [_: `$.${number}.fake`]: '$.*.fake',
        },
        '$.0.fake'
      >(typeDef, '$.0.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.*.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.*.fake'>()
      })
    })
  })

  describe('record', function () {
    type Key = 'a' | 'b'
    const typeDef = record<typeof numberType, Key>(numberType)
    type Paths = ValueToTypePathsOfType<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$.a',
        '$.*',
      ],
      [
        '$.b',
        '$.*',
      ],
    ] as const)('it maps "%s"', function (from, to) {
      const typePath = valuePathToTypePath<Paths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake subpath', function () {
      const fakeTypePath = valuePathToTypePath<
        Paths & {
          '$.a.fake': '$.*.fake',
          '$.b.fake': '$.*.fake',
        },
        '$.a.fake'
      >(typeDef, '$.a.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.*.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.*.fake'>()
      })
    })
  })

  describe('object', function () {
    const typeDef = object()
      .field('a', numberType)
      .field('b', booleanType)
    type Paths = ValueToTypePathsOfType<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$.a',
        '$.a',
      ],
      [
        '$.b',
        '$.b',
      ],
    ] as const)('it maps %s', function (from, to) {
      const typePath = valuePathToTypePath<Paths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake field', function () {
      const fakeTypePath = valuePathToTypePath<
        Paths & {
          '$.fake': '$.fake',
        },
        '$.fake'
      >(typeDef, '$.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
      })
    })
  })

  describe('union', function () {
    describe('discriminated', function () {
      const typeDef = union('w')
        .or('x', object().field('a', numberType).field('b', booleanType))
        .or('y', object().field('b', stringType).field('c', booleanType))
      type Paths = ValueToTypePathsOfType<typeof typeDef>

      describe.each([
        [
          '$',
          '$',
        ],
        [
          '$:x.a',
          '$:x.a',
        ],
        [
          '$:x.b',
          '$:x.b',
        ],
        [
          '$:y.b',
          '$:y.b',
        ],
        [
          '$:y.c',
          '$:y.c',
        ],
      ] as const)('it maps %s', function (from, to) {
        const typePath = valuePathToTypePath<Paths, typeof from>(typeDef, from)

        it('maps a value path to the expected type path', function () {
          expect(typePath).toEqual(to)
        })

        it('has expected type', function () {
          expectTypeOf(typePath).toEqualTypeOf(to)
        })
      })

      describe('fake', function () {
        const fakeTypePath = valuePathToTypePath<
          Paths & {
            '$.fake': '$.fake',
          },
          '$.fake'
        >(typeDef, '$.fake', true)

        it('maps a value path to the expected type path', function () {
          expect(fakeTypePath).toEqual('$.fake')
        })

        it('has expected type', function () {
          expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
        })
      })

      describe('nested discriminated', () => {
        const nestedTypeDef = object().field('o', typeDef)
        type Paths = ValueToTypePathsOfType<typeof nestedTypeDef>

        describe.each([
          [
            '$',
            '$',
          ],
          [
            '$.o',
            '$.o',
          ],
          [
            '$.o:x.a',
            '$.o:x.a',
          ],
          [
            '$.o:x.b',
            '$.o:x.b',
          ],
          [
            '$.o:y.b',
            '$.o:y.b',
          ],
          [
            '$.o:y.c',
            '$.o:y.c',
          ],
        ] as const)('it maps %s', function (from, to) {
          const typePath = valuePathToTypePath<Paths, typeof from>(nestedTypeDef, from)

          it('maps a value path to the expected type path', function () {
            expect(typePath).toEqual(to)
          })

          it('has expected type', function () {
            expectTypeOf(typePath).toEqualTypeOf(to)
          })
        })
      })

      describe('list discriminated', () => {
        const listTypeDef = list(typeDef)
        type Paths = ValueToTypePathsOfType<typeof listTypeDef>

        describe.each([
          [
            '$',
            '$',
          ],
          [
            '$.0',
            '$.*',
          ],
          [
            '$.0:x.a',
            '$.*:x.a',
          ],
          [
            '$.0:x.b',
            '$.*:x.b',
          ],
          [
            '$.99:y.b',
            '$.*:y.b',
          ],
          [
            '$.1:y.c',
            '$.*:y.c',
          ],
        ] as const)('it maps %s', function (from, to) {
          const typePath = valuePathToTypePath<Paths, typeof from>(listTypeDef, from)

          it('maps a value path to the expected type path', function () {
            expect(typePath).toEqual(to)
          })

          it('has expected type', function () {
            expectTypeOf(typePath).toEqualTypeOf(to)
          })
        })
      })
    })
  })
})
