import {
  booleanType,
  type FlattenedAccessorsOf,
  type FlattenedTypeDefsOf,
  type FlattenedValueTypesOf,
  type JsonPathsOf,
  list,
  literal,
  numberType,
  object,
  type ReadonlyTypeDefOf,
  stringType,
  union,
  type ValueToTypePathsOf,
  type ValueTypeOf,
} from '@strictly/define'

export type DogBreed = 'Alsatian' | 'Pug' | 'other'
export type CatBreed = 'Burmese' | 'Siamese' | 'DSH'

export const dogBreedType = literal<DogBreed | null>()
export const catBreedType = literal<CatBreed | null>()

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
  .set('species', speciesType)
  .narrow

export type TagValuePath = `$.tags.${number}`

export type MutablePet = ValueTypeOf<typeof petType>
export type Pet = ValueTypeOf<ReadonlyTypeDefOf<typeof petType>>
export type PetValuePaths = JsonPathsOf<typeof petType>
export type PetTypePaths = JsonPathsOf<typeof petType, '*'>
export type FlattenedPetTypeDefs = FlattenedTypeDefsOf<typeof petType, '*'>
export type PetValueToTypePaths = ValueToTypePathsOf<typeof petType> & {
  '$.newTag': '$.newTag',
}
export type FlattenedPetValueTypes = FlattenedValueTypesOf<typeof petType>
export type FlattenedPetAccessors = FlattenedAccessorsOf<typeof petType>

export const NAME_TOO_SHORT_ERROR = {
  type: 'name too short',
  minLength: 2,
} as const
export const NOT_A_NUMBER_ERROR = 'not a number'
export const NOT_A_BREED_ERROR = 'not a breed'
