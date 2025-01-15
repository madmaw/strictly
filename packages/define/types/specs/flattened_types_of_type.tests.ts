import { type SimplifyDeep } from 'type-fest'
import {
  booleanType,
  list,
  numberType,
  object,
  record,
  stringType,
  union,
} from 'types/builders'
import { type TypeDefType } from 'types/definitions'
import { type FlattenedTypesOfType } from 'types/flattened_types_of_type'

describe('FlattenedTypesOfType', function () {
  describe('literal', function () {
    type T = FlattenedTypesOfType<typeof numberType._type, null>

    let t: {
      readonly $: {
        readonly definition: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(numberType)
    type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, '*'>>

    let t: {
      readonly $: SimplifyDeep<typeof builder._type>,
      readonly ['$.*']: {
        readonly definition: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('record', function () {
    const builder = record<typeof numberType, 'a' | 'b'>(numberType)
    type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, '*'>>

    let t: {
      readonly $: SimplifyDeep<typeof builder._type>,
      readonly ['$.*']: {
        readonly definition: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: [number],
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf<typeof t>(t).toEqualTypeOf<T>()
    })
  })

  describe('object', function () {
    describe('simple', function () {
      const builder = object()
        .field('a', numberType)
        .optionalField('b', stringType)
        .readonlyField('c', booleanType)
        .readonlyOptionalField('d', stringType)
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, null>>
      let t: {
        readonly $: SimplifyDeep<typeof builder._type>,
        readonly ['$.a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
        readonly ['$.b']: {
          readonly definition: {
            readonly discriminator: null,
            readonly type: TypeDefType.Union,
            readonly unions: {
              readonly '0': {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [string],
              },
              readonly '1': {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [undefined],
              },
            },
          },
        },
        readonly ['$.c']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.d']: {
          readonly definition: {
            readonly discriminator: null,
            readonly type: TypeDefType.Union,
            readonly unions: {
              readonly '0': {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [string],
              },
              readonly '1': {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [undefined],
              },
            },
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('optional', function () {
      const builder = object().optionalField('a', stringType)
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder._type>,
        readonly '$.a': {
          readonly definition: {
            readonly discriminator: null,
            readonly type: TypeDefType.Union,
            readonly unions: {
              readonly '0': {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [string],
              },
              readonly '1': {
                readonly type: TypeDefType.Literal,
                readonly valuePrototype: [undefined],
              },
            },
          },
        },
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })
})

describe('union', function () {
  describe('overlapping', function () {
    describe('non-discriminated', function () {
      const builder = union()
        .or('x', object().field('a', booleanType))
        .or('y', object().field('b', numberType))
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder._type>,
        readonly ['$.a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.b']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('discriminated', function () {
      const builder = union('x')
        .or('1', object().field('a', booleanType))
        .or('2', object().field('a', numberType))
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder._type>,
        readonly ['$.1:a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.2:a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('nested discriminated', function () {
      const builder = union('x')
        .or(
          '1',
          union('y')
            .or('p', object().field('a', booleanType))
            .or('q', object().field('a', stringType)),
        )
        .or(
          '2',
          union('z')
            .or('r', object().field('b', numberType))
            .or('s', object().field('c', stringType)),
        )
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder._type, null>>
      let t: {
        readonly $: SimplifyDeep<typeof builder._type>,
        readonly ['$.1:p:a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [boolean],
          },
        },
        readonly ['$.1:q:a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
        readonly ['$.2:r:b']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
        readonly ['$.2:s:c']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
          },
        },
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })
})
