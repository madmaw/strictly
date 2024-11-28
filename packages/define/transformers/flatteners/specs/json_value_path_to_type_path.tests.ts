import { jsonValuePathToTypePath } from 'transformers/flatteners/json_value_path_to_type_path'
import {
  boolean,
  list,
  map,
  number,
  string,
  struct,
  union,
} from 'types/builders'
import { type FlattenedJsonValueToTypePathsOf } from 'types/flattened_json_value_to_type_paths_of'

describe('jsonValuePathToTypePath', function () {
  describe('literal', function () {
    const typeDef = number
    type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>

    const typePath = jsonValuePathToTypePath<JsonPaths, '$'>(typeDef, '$')

    it('maps a value path to the expected type path', function () {
      expect(typePath).toEqual('$')
    })

    it('has expected type', function () {
      expectTypeOf(typePath).toEqualTypeOf<'$'>()
    })
  })

  describe('list', function () {
    const typeDef = list(number)
    type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$[0]',
        '$.*',
      ],
    ] as const)('it maps "%s"', function (from, to) {
      const typePath = jsonValuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })
  })

  describe('map', function () {
    const typeDef = map<typeof number, 'a' | 'b'>(number)
    type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>

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
      const typePath = jsonValuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })
  })

  describe('struct', function () {
    const typeDef = struct().set('a', number).set('b', boolean)
    type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>

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
      const typePath = jsonValuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })
  })

  describe('union', function () {
    describe('discriminated', function () {
      const typeDef = union('w')
        .add('x', struct().set('a', number).set('b', boolean))
        .add('y', struct().set('b', string).set('c', boolean))
      type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>

      describe.each([
        [
          '$',
          '$',
        ],
        [
          '$.x:a',
          '$.x:a',
        ],
        [
          '$.x:b',
          '$.x:b',
        ],
        [
          '$.y:b',
          '$.y:b',
        ],
        [
          '$.y:c',
          '$.y:c',
        ],
      ] as const)('it maps %s', function (from, to) {
        const typePath = jsonValuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

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
