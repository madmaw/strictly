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
  type ValidatorsOfValues,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'

export type DogBreed = 'Alsatian' | 'Pug' | 'other'
export type CatBreed = 'Burmese' | 'Siamese' | 'DSH'

export const dogBreedType = literal<DogBreed>()
export const catBreedType = literal<CatBreed>()

export const ownerType = object()
  .set('firstName', stringType)
  .set('surname', stringType)
  .set('phoneNumber', stringType)
  .setOptional('email', stringType)
  .narrow

export const speciesType = union('type')
  .add(
    'dog',
    object()
      .set('barks', numberType)
      .setOptional('breed', dogBreedType),
  )
  .add(
    'cat',
    object()
      .set('meows', numberType)
      .setOptional('breed', catBreedType),
  )

export type Species = keyof typeof speciesType['definition']['unions']

export const petType = object()
  .set('name', stringType)
  .set('alive', booleanType)
  .set('tags', list(stringType))
  .setOptional('owner', ownerType)
  .set('species', speciesType)
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

export const petValidators = {
  '$.name': new MinimumStringLengthValidator(3),
  '$.species': new DefinedValidator(REQUIRED_ERROR),
  '$.species.cat:breed': new DefinedValidator(REQUIRED_ERROR),
  '$.species.dog:breed': new DefinedValidator(REQUIRED_ERROR),
} as const satisfies Partial<ValidatorsOfValues<
  FlattenedValuesOfType<typeof petType, '*'>,
  PetTypeToValuePaths,
  Pet
>>
