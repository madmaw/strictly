import {
  type IsStrictUnion,
  type StrictUnionTypeDef,
} from 'types/StrictType'
import {
  type TypeDefType,
  type UnionTypeDef,
} from 'types/Type'

describe('Strict Definitions', function () {
  describe('IsStrictUnion', function () {
    it('detects a non-discriminated strict union', function () {
      type U = {
        readonly [1]: {
          type: TypeDefType.Literal,
          valuePrototype: ['a'],
        },
      }
      type C = IsStrictUnion<U>
      expectTypeOf<C>().toEqualTypeOf<true>()
    })

    it('detects a union with a non-literal type', function () {
      type U = {
        readonly [1]: {
          type: TypeDefType.List,
          elements: {
            type: TypeDefType.Literal,
            valuePrototype: ['a'],
          },
        },
      }
      type C = IsStrictUnion<U>
      expectTypeOf<C>().toEqualTypeOf<false>()
    })

    it('detects a union with a non-literal type in position 0', function () {
      type U = {
        readonly [0]: {
          type: TypeDefType.List,
          elements: {
            type: TypeDefType.Literal,
            valuePrototype: ['a'],
          },
        },
      }
      type C = IsStrictUnion<U>
      expectTypeOf<C>().toEqualTypeOf<true>()
    })

    it('detects a non-discriminated strict union with multiple options and a non-literal type', function () {
      type U = {
        readonly [1]: {
          type: TypeDefType.Literal,
          valuePrototype: ['a'],
        },
        readonly [2]: {
          type: TypeDefType.Literal,
          valuePrototype: ['c'],
        },
        readonly [0]: {
          type: TypeDefType.List,
          elements: {
            type: TypeDefType.Literal,
            valuePrototype: ['a'],
          },
        },
      }
      type C = IsStrictUnion<U>
      expectTypeOf<C>().toEqualTypeOf<true>()
    })
  })

  describe('StrictUnion', function () {
    it('enforces non-strict unions are of type never', function () {
      type U = {
        readonly [1]: {
          type: TypeDefType.List,
          elements: {
            type: TypeDefType.Literal,
            valuePrototype: ['a'],
          },
        },
      }
      type C = StrictUnionTypeDef<null, U>
      expectTypeOf<C>().toEqualTypeOf<never>()
    })

    it('allows unions of multiple literal options', function () {
      type U = {
        readonly [1]: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a'],
        },
        readonly [2]: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['c'],
        },
      }
      type C = StrictUnionTypeDef<null, U>
      expectTypeOf<C>().toEqualTypeOf<{
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: U,
      }>()
    })

    it('allows unions of multiple literal options and one complex type', function () {
      type U = {
        readonly [1]: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a'],
        },
        readonly [2]: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['c'],
        },
        readonly [0]: {
          type: TypeDefType.List,
          elements: {
            type: TypeDefType.Literal,
            valuePrototype: ['a'],
          },
        },
      }
      type C = StrictUnionTypeDef<null, U>
      expectTypeOf<C>().toEqualTypeOf<{
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: U,
      }>()
    })
  })

  describe('assignment', function () {
    describe('can be assigned to a non-strict equivalent type', function () {
      type U = {
        readonly [1]: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['a'],
        },
        readonly [2]: {
          readonly type: TypeDefType.Literal,
          readonly valuePrototype: ['c'],
        },
        readonly [0]: {
          type: TypeDefType.List,
          elements: {
            type: TypeDefType.Literal,
            valuePrototype: ['a'],
          },
        },
      }
      type S = StrictUnionTypeDef<null, U>

      type C = UnionTypeDef<null, U>
      it('equals type', function () {
        expectTypeOf<S>().toEqualTypeOf<C>()
      })
    })
  })

  describe('cannot be assigned to an invalid non-strict equivalent type', function () {
    type U = {
      readonly [2]: {
        readonly type: TypeDefType.Literal,
        readonly valuePrototype: ['a'],
      },
      readonly [1]: {
        type: TypeDefType.List,
        elements: {
          type: TypeDefType.Literal,
          valuePrototype: ['a'],
        },
      },
    }
    type S = StrictUnionTypeDef<null, U>

    type C = UnionTypeDef<null, U>
    it('equals type', function () {
      expectTypeOf<C>().not.toMatchTypeOf<S>()
    })
  })
})
