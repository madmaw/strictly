import { type Reverse } from '@strictly/base'
import {
  booleanType,
  DefinedValidator,
  type FlattenedAccessorsOfType,
  type FlattenedTypesOfType,
  type FlattenedValuesOfType,
  list,
  literal,
  MinimumStringLengthValidator,
  numberType,
  object,
  type PathsOfType,
  type ReadonlyTypeOfType,
  stringType,
  union,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import { petOwnerType } from './pet_owner_fields_view'

// TODO move definitions into respective views

// eslint false negative
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const NOT_A_NUMBER_ERROR = 'not a number' as const
// eslint false negative
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const NOT_A_BREED_ERROR = 'not a breed' as const
// eslint false negative
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const REQUIRED_ERROR = 'is required' as const

const minimumNameLengthValidator = new MinimumStringLengthValidator(3)
const definedValidator = new DefinedValidator(REQUIRED_ERROR)

// TODO  move individual types to relevant forms
export type DogBreed = 'Alsatian' | 'Pug' | 'other'
export type CatBreed = 'Burmese' | 'Siamese' | 'DSH'

export const dogBreedType = literal<DogBreed>()
  .required()
  .enforce(definedValidator.validate.bind(definedValidator))
  .narrow
export const catBreedType = literal<CatBreed>()
  .required()
  .enforce(definedValidator.validate.bind(definedValidator))
  .narrow

export const speciesType = union('type')
  .or(
    'dog',
    object()
      .field('barks', numberType.required())
      .optionalField('breed', dogBreedType),
  )
  .or(
    'cat',
    object()
      .field('meows', numberType.required())
      .optionalField('breed', catBreedType),
  ).narrow

export type Species = keyof typeof speciesType['definition']['unions']

export const petType = object()
  .field('name', stringType.enforce(minimumNameLengthValidator))
  .field('alive', booleanType)
  .field('tags', list(stringType))
  .optionalField('owner', petOwnerType)
  .field('species', speciesType)
  .narrow

export type TagValuePath = `$.tags.${number}`

export type MutablePet = ValueOfType<typeof petType>
export type Pet = ValueOfType<ReadonlyTypeOfType<typeof petType>>
export type PetValuePaths = PathsOfType<typeof petType>
export type PetTypePaths = PathsOfType<typeof petType, '*'>
export type FlattenedPetTypes = FlattenedTypesOfType<typeof petType, '*'>
export type PetValueToTypePaths = ValueToTypePathsOfType<typeof petType> & {
  '$.newTag': '$.newTag',
}
export type FlattenedPetValues = FlattenedValuesOfType<typeof petType>
export type FlattenedPetAccessors = FlattenedAccessorsOfType<typeof petType>

export type PetTypeToValuePaths = Reverse<PetValueToTypePaths>
