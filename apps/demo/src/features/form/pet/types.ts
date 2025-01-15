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
  type ValidatorsOfValues,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import { mergeValidators } from '@strictly/react-form'

export type DogBreed = 'Alsatian' | 'Pug' | 'other'
export type CatBreed = 'Burmese' | 'Siamese' | 'DSH'

export const dogBreedType = literal<DogBreed>()
export const catBreedType = literal<CatBreed>()

export const ownerType = object()
  .field('firstName', stringType)
  .field('surname', stringType)
  .field('phoneNumber', stringType)
  .optionalField('email', stringType)
  .narrow

export const speciesType = union('type')
  .or(
    'dog',
    object()
      .field('barks', numberType)
      .optionalField('breed', dogBreedType),
  )
  .or(
    'cat',
    object()
      .field('meows', numberType)
      .optionalField('breed', catBreedType),
  ).narrow

export type Species = keyof typeof speciesType['definition']['unions']

const minimumNameLengthValidator = new MinimumStringLengthValidator(3)
const minimumTagLengthValidator = new MinimumStringLengthValidator(2)

export const petType = object()
  .field('name', stringType.addRule(minimumNameLengthValidator.validate.bind(minimumNameLengthValidator)))
  .field('alive', booleanType)
  .field('tags', list(stringType.addRule(minimumTagLengthValidator.validate.bind(minimumTagLengthValidator))))
  .optionalField('owner', ownerType)
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

// eslint false negative
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const NOT_A_NUMBER_ERROR = 'not a number' as const
// eslint false negative
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const NOT_A_BREED_ERROR = 'not a breed' as const
// eslint false negative
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const REQUIRED_ERROR = 'is required' as const

export type PetTypeToValuePaths = Reverse<PetValueToTypePaths>

const petValidators1 = flattenValidatorsOfValidatingType<typeof petType, PetTypeToValuePaths>(
  petType,
) satisfies Partial<ValidatorsOfValues<
  FlattenedValuesOfType<typeof petType, '*'>,
  PetTypeToValuePaths,
  Pet
>>

// TODO remove these and make mandatory/readonly enforcement/exposition part of field validators
const petValidators2 = {
  '$.species': new DefinedValidator(REQUIRED_ERROR),
  '$.species.cat:breed': new DefinedValidator(REQUIRED_ERROR),
  '$.species.dog:breed': new DefinedValidator(REQUIRED_ERROR),
  // TODO validation of synthesized fields
  // '$.newTag': minimumTagLengthValidator,
} as const satisfies Partial<ValidatorsOfValues<
  FlattenedValuesOfType<typeof petType, '*'>,
  PetTypeToValuePaths,
  Pet
>>

export const petValidators = mergeValidators<typeof petValidators1, typeof petValidators2>(petValidators1,
  petValidators2) satisfies Partial<ValidatorsOfValues<
    FlattenedValuesOfType<typeof petType, '*'>,
    PetTypeToValuePaths,
    Pet
  >>
