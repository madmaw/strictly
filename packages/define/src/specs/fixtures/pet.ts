import {
  booleanType,
  list,
  literal,
  nullable,
  numberType,
  object,
  stringType,
  union,
} from 'types/builders'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type ValueOfType } from 'types/ValueOfType'
import { type FunctionalValidator } from 'validation/validator'
import { DefinedValidator } from 'validation/validators/DefinedValidator'
import { MinimumStringLengthValidator } from 'validation/validators/MinimumStringLengthValidator'

/**
 * A type with rules, context, annotations, optional and nullable fields, a list and a discriminated
 * union, for tests that need all of those together
 */

export type DogBreed = 'Alsatian' | 'Pug' | 'other'

export const REQUIRED_ERROR = 'is required'

export type CatNameMustBeCapitalized = {
  readonly type: 'capitalized'
}

export type CatNameContext = {
  readonly isCat: boolean
}

export const catNameMustBeCapitalized: FunctionalValidator<
  string,
  CatNameMustBeCapitalized,
  string,
  CatNameContext
> = (value, _path, { isCat }) => {
  const first = value.charAt(0)
  return isCat && first !== first.toUpperCase() ? { type: 'capitalized' } : null
}

const definedValidator = new DefinedValidator(REQUIRED_ERROR)

export const dogBreedType = literal<DogBreed>()
  .required()
  .enforce(definedValidator.validate.bind(definedValidator)).narrow

export const speciesType = union('type')
  .or(
    'dog',
    object()
      .field('barks', numberType.required())
      .optionalField('breed', dogBreedType)
      .readonly(),
  )
  .or('cat', object().field('meows', numberType.required()).readonly()).narrow

export const petOwnerType = object()
  .field('firstName', stringType.enforce(new MinimumStringLengthValidator(2)))
  .field('email', stringType).narrow

export const petType = object()
  .field(
    'name',
    stringType
      .enforce(new MinimumStringLengthValidator(3))
      .enforce(catNameMustBeCapitalized),
  )
  .field('alive', booleanType)
  .field('tags', list(stringType))
  .field('owner', nullable(petOwnerType))
  .readonlyField('species', speciesType).narrow

export type Pet = ValueOfType<typeof petType>
export type ReadonlyPet = ValueOfType<ReadonlyTypeOfType<typeof petType>>

export const rex: ReadonlyPet = {
  name: 'Rex',
  alive: true,
  tags: ['a'],
  owner: {
    firstName: 'Bob',
    email: '',
  },
  species: {
    type: 'dog',
    barks: 1,
  },
}
