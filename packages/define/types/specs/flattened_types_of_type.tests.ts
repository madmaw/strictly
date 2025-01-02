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
    type T = FlattenedTypesOfType<typeof numberType, null>

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
    type T = SimplifyDeep<FlattenedTypesOfType<typeof builder, '*'>>

    let t: {
      readonly $: SimplifyDeep<typeof builder.narrow>,
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
    type T = SimplifyDeep<FlattenedTypesOfType<typeof builder, '*'>>

    let t: {
      readonly $: SimplifyDeep<typeof builder.narrow>,
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
        .set('a', numberType)
        .setOptional('b', stringType)
        .setReadonly('c', booleanType)
        .setReadonlyOptional('d', stringType)
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
        readonly ['$.a']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [number],
          },
        },
        readonly ['$.b']: {
          readonly definition: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: [string],
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

describe('union', function () {
  describe('overlapping', function () {
    describe('non-discriminated', function () {
      const builder = union()
        .add('x', object().set('a', booleanType))
        .add('y', object().set('b', numberType))
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
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
        .add('1', object().set('a', booleanType))
        .add('2', object().set('a', numberType))
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder, null>>

      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
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
        .add(
          '1',
          union('y')
            .add('p', object().set('a', booleanType))
            .add('q', object().set('a', stringType)),
        )
        .add(
          '2',
          union('z')
            .add('r', object().set('b', numberType))
            .add('s', object().set('c', stringType)),
        )
      type T = SimplifyDeep<FlattenedTypesOfType<typeof builder, null>>
      let t: {
        readonly $: SimplifyDeep<typeof builder.narrow>,
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
