import {
  booleanType,
  type FlattenedAccessorsOf,
  type FlattenedTypeDefsOf,
  type FlattenedValueTypesOf,
  list,
  numberType,
  object,
  type ReadonlyTypeDefOf,
  stringType,
  union,
  type ValueToTypePathsOf,
  type ValueTypeOf,
} from '@de/fine'
import { type JsonPathsOf } from '@de/fine/types/json_paths_of'

export type DogBreeds = 'Alsatian' | 'Pug' | 'Other'
export type CatBreeds = 'Burmese' | 'Siamese' | 'Domestic Short Hair'

export const speciesTypeDef = union('type')
  .add('dog', object().set('barks', numberType))
  .add('cat', object().set('meows', numberType))

export type Species = keyof typeof speciesTypeDef['definition']['unions']

export const petTypeDef = object()
  .set('name', stringType)
  .set('alive', booleanType)
  .set('tags', list(stringType))
  .set('species', speciesTypeDef)
  .narrow

export type TagValuePath = `$.tags.${number}`

export type MutablePet = ValueTypeOf<typeof petTypeDef>
export type Pet = ValueTypeOf<ReadonlyTypeDefOf<typeof petTypeDef>>
export type PetValuePaths = JsonPathsOf<typeof petTypeDef>
export type PetTypePaths = JsonPathsOf<typeof petTypeDef, '*'>
export type FlattenedPetTypeDefs = FlattenedTypeDefsOf<typeof petTypeDef, '*'>
export type PetValueToTypePaths = ValueToTypePathsOf<typeof petTypeDef> & {
  '$.newTag': '$.newTag',
}
export type FlattenedPetValueTypes = FlattenedValueTypesOf<typeof petTypeDef>
export type FlattenedPetAccessors = FlattenedAccessorsOf<typeof petTypeDef>

export const NAME_TOO_SHORT_ERROR = 'name too short'
export const NOT_A_NUMBER_ERROR = 'not a number'
