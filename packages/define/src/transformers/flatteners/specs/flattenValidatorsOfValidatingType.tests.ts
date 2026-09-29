import { type Reverse } from '@strictly/base'
import { petType, REQUIRED_ERROR } from 'specs/fixtures/pet'
import { flattenValidatorsOfValidatingTypeWithMutability } from 'transformers/flatteners/flattenValidatorsOfValidatingType'
import { numberType, object, stringType } from 'types/builders'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'
import { annotations, validate, type Validator } from 'validation/validator'

type PetTypeToValuePaths = Reverse<ValueToTypePathsOfType<typeof petType>>

describe('flattenValidatorsOfValidatingType', () => {
  describe('rules', () => {
    const validators = flattenValidatorsOfValidatingTypeWithMutability<
      typeof petType,
      PetTypeToValuePaths
    >(petType)

    it('only has validators for the paths with rules', () => {
      expectTypeOf<keyof typeof validators>().toEqualTypeOf<
        '$.name' | '$.owner.firstName' | '$.species:dog.breed'
      >()
    })

    it('runs the rules in order and returns the first error', () => {
      expect(
        validate(validators['$.name'], 'Re', '$.name', { isCat: true }),
      ).toEqual({
        type: 'minimum_string_length',
        receivedLength: 2,
        minimumLength: 3,
      })
      expect(
        validate(validators['$.name'], 'rex', '$.name', { isCat: true }),
      ).toEqual({ type: 'capitalized' })
      expect(
        validate(validators['$.name'], 'rex', '$.name', { isCat: false }),
      ).toBeNull()
    })

    it('validates through optional wrappers', () => {
      expect(
        validate(
          validators['$.species:dog.breed'],
          undefined,
          '$.species:dog.breed',
          {},
        ),
      ).toEqual(REQUIRED_ERROR)
    })
  })

  describe('annotations', () => {
    const validators: Record<string, Validator> =
      flattenValidatorsOfValidatingTypeWithMutability(petType)

    it('merges the annotations of annotated validators', () => {
      expect(annotations(validators['$.name'], '$.name', {})).toEqual({
        required: true,
        readonly: false,
      })
    })

    it('reads annotations through optional wrappers', () => {
      expect(
        annotations(validators['$.species:dog.breed'], '$.species.breed', {}),
      ).toEqual({
        required: true,
        readonly: false,
      })
    })

    it('annotates the discriminator as readonly and required', () => {
      expect(annotations(validators['$.species:dog.type'], '', {})).toEqual({
        required: true,
        readonly: true,
      })
    })

    it('can be forced to be mutable', () => {
      expect(
        annotations(validators['$.species'], '', { forceMutable: false }),
      ).toEqual({
        required: false,
        readonly: true,
      })
      expect(
        annotations(validators['$.species'], '', { forceMutable: true }),
      ).toEqual({
        required: false,
        readonly: false,
      })
    })
  })

  describe('without rules', () => {
    const type = object()
      .field('a', numberType.required())
      .field('b', stringType).narrow
    const validators: Record<string, Validator> =
      flattenValidatorsOfValidatingTypeWithMutability(type)

    it('has a validator for every path', () => {
      expect(Object.keys(validators).sort()).toEqual(['$', '$.a', '$.b'])
      expect(validate(validators['$.a'], 1, '$.a', {})).toBeNull()
      expect(annotations(validators['$.a'], '$.a', {})).toEqual({
        required: true,
        readonly: false,
      })
    })
  })
})
