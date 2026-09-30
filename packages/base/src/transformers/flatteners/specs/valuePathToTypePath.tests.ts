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

describe('valuePathToTypePath', () => {
  describe('literal', () => {
    const type = numberType.narrow
    type Paths = ValueToTypePathsOfType<typeof type>

    const typePath = valuePathToTypePath<Paths, '$'>(type, '$')

    it('maps a value path to the expected type path', () => {
      expect(typePath).toEqual('$')
    })

    it('has expected type', () => {
      expectTypeOf(typePath).toEqualTypeOf<'$'>()
    })

    describe('fake subpath', () => {
      const fakeTypePath = valuePathToTypePath<
        {
          '$.fake': '$.fake'
        },
        '$.fake'
      >(type, '$.fake', true)

      it('maps a value path to the expected type path', () => {
        expect(fakeTypePath).toEqual('$.fake')
      })

      it('has expected type', () => {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
      })
    })
  })

  describe('list', () => {
    const type = list(numberType).narrow
    type Paths = ValueToTypePathsOfType<typeof type>

    describe.each([
      ['$', '$'],
      ['$.0', '$.*'],
    ] as const)('it maps "%s"', (from, to) => {
      const typePath = valuePathToTypePath<Paths, typeof from>(type, from)

      it('maps a value path to the expected type path', () => {
        expect(typePath).toEqual(to)
      })

      it('has expected type', () => {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake subpath', () => {
      const fakeTypePath = valuePathToTypePath<
        Paths & {
          [_: `$.${number}.fake`]: '$.*.fake'
        },
        '$.0.fake'
      >(type, '$.0.fake', true)

      it('maps a value path to the expected type path', () => {
        expect(fakeTypePath).toEqual('$.*.fake')
      })

      it('has expected type', () => {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.*.fake'>()
      })
    })
  })

  describe('record', () => {
    type Key = 'a' | 'b'
    const type = record<typeof numberType, Key>(numberType).narrow
    type Paths = ValueToTypePathsOfType<typeof type>

    describe.each([
      ['$', '$'],
      ['$.a', '$.*'],
      ['$.b', '$.*'],
    ] as const)('it maps "%s"', (from, to) => {
      const typePath = valuePathToTypePath<Paths, typeof from>(type, from)

      it('maps a value path to the expected type path', () => {
        expect(typePath).toEqual(to)
      })

      it('has expected type', () => {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake subpath', () => {
      const fakeTypePath = valuePathToTypePath<
        Paths & {
          '$.a.fake': '$.*.fake'
          '$.b.fake': '$.*.fake'
        },
        '$.a.fake'
      >(type, '$.a.fake', true)

      it('maps a value path to the expected type path', () => {
        expect(fakeTypePath).toEqual('$.*.fake')
      })

      it('has expected type', () => {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.*.fake'>()
      })
    })
  })

  describe('object', () => {
    const type = object().field('a', numberType).field('b', booleanType).narrow
    type Paths = ValueToTypePathsOfType<typeof type>

    describe.each([
      ['$', '$'],
      ['$.a', '$.a'],
      ['$.b', '$.b'],
    ] as const)('it maps %s', (from, to) => {
      const typePath = valuePathToTypePath<Paths, typeof from>(type, from)

      it('maps a value path to the expected type path', () => {
        expect(typePath).toEqual(to)
      })

      it('has expected type', () => {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake field', () => {
      const fakeTypePath = valuePathToTypePath<
        Paths & {
          '$.fake': '$.fake'
        },
        '$.fake'
      >(type, '$.fake', true)

      it('maps a value path to the expected type path', () => {
        expect(fakeTypePath).toEqual('$.fake')
      })

      it('has expected type', () => {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
      })
    })
  })

  describe('optional field', () => {
    const type = object().optionalField('a', list(numberType)).narrow
    type Paths = ValueToTypePathsOfType<typeof type>

    describe.each([
      ['$.a', '$.a'],
      ['$.a.2', '$.a.*'],
    ] as const)('it maps %s', (from, to) => {
      const typePath = valuePathToTypePath<Paths, typeof from>(type, from)

      it('maps a value path through the wrapper', () => {
        expect(typePath).toEqual(to)
      })

      it('has expected type', () => {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })
  })

  describe('union', () => {
    describe('discriminated', () => {
      const type = union('w')
        .or('x', object().field('a', numberType).field('b', booleanType))
        .or('y', object().field('b', stringType).field('c', booleanType)).narrow
      type Paths = ValueToTypePathsOfType<typeof type>

      describe.each([
        ['$', '$'],
        ['$:x.a', '$:x.a'],
        ['$:x.b', '$:x.b'],
        ['$:x.w', '$:x.w'],
        ['$:y.b', '$:y.b'],
        ['$:y.c', '$:y.c'],
      ] as const)('it maps %s', (from, to) => {
        const typePath = valuePathToTypePath<Paths, typeof from>(type, from)

        it('maps a value path to the expected type path', () => {
          expect(typePath).toEqual(to)
        })

        it('has expected type', () => {
          expectTypeOf(typePath).toEqualTypeOf(to)
        })
      })

      describe('fake', () => {
        const fakeTypePath = valuePathToTypePath<
          Paths & {
            '$.fake': '$.fake'
          },
          '$.fake'
        >(type, '$.fake', true)

        it('maps a value path to the expected type path', () => {
          expect(fakeTypePath).toEqual('$.fake')
        })

        it('has expected type', () => {
          expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
        })
      })

      describe('nested discriminated', () => {
        const nestedType = object().field('o', type).narrow
        type Paths = ValueToTypePathsOfType<typeof nestedType>

        describe.each([
          ['$', '$'],
          ['$.o', '$.o'],
          ['$.o:x.a', '$.o:x.a'],
          ['$.o:x.b', '$.o:x.b'],
          ['$.o:y.b', '$.o:y.b'],
          ['$.o:y.c', '$.o:y.c'],
        ] as const)('it maps %s', (from, to) => {
          const typePath = valuePathToTypePath<Paths, typeof from>(
            nestedType,
            from,
          )

          it('maps a value path to the expected type path', () => {
            expect(typePath).toEqual(to)
          })

          it('has expected type', () => {
            expectTypeOf(typePath).toEqualTypeOf(to)
          })
        })
      })

      describe('list discriminated', () => {
        const listType = list(type).narrow
        type Paths = ValueToTypePathsOfType<typeof listType>

        describe.each([
          ['$', '$'],
          ['$.0', '$.*'],
          ['$.0:x.a', '$.*:x.a'],
          ['$.0:x.b', '$.*:x.b'],
          ['$.99:y.b', '$.*:y.b'],
          ['$.1:y.c', '$.*:y.c'],
        ] as const)('it maps %s', (from, to) => {
          const typePath = valuePathToTypePath<Paths, typeof from>(
            listType,
            from,
          )

          it('maps a value path to the expected type path', () => {
            expect(typePath).toEqual(to)
          })

          it('has expected type', () => {
            expectTypeOf(typePath).toEqualTypeOf(to)
          })
        })
      })
    })
  })
})
