import { type Reverse } from '@strictly/base'
import {
  booleanType,
  DefinedValidator,
  type FlattenedAccessorsOfType,
  type FlattenedTypesOfType,
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingType,
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
import { petOwnerType } from './pet_owner_form'

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
const minimumTagLengthValidator = new MinimumStringLengthValidator(2)
const definedValidator = new DefinedValidator(REQUIRED_ERROR)

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
  .field('name', stringType.required(), minimumNameLengthValidator.validate.bind(minimumNameLengthValidator))
  .field('alive', booleanType)
  .field('tags', list(stringType.enforce(minimumTagLengthValidator.validate.bind(minimumTagLengthValidator))))
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

export const petValidators = flattenValidatorsOfValidatingType<typeof petType, PetTypeToValuePaths>(
  petType,
)
