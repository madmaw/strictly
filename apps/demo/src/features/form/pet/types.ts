import {
  boolean,
  type FlattenedAccessorsOf,
  type FlattenedJsonValueToTypePathsOf,
  type FlattenedTypeDefsOf,
  type FlattenedValueTypesOf,
  number,
  type ReadonlyTypeDefOf,
  string,
  struct,
  union,
  type ValueTypeOf,
} from '@de/fine'
import { type JsonPathsOf } from '@de/fine/types/json_paths_of'

export type DogBreeds = 'Alsatian' | 'Pug' | 'Other'
export type CatBreeds = 'Burmese' | 'Siamese' | 'Domestic Short Hair'

export const speciesTypeDef = union('type')
  .add('dog', struct().set('barks', number))
  .add('cat', struct().set('meows', number))

export type Species = keyof typeof speciesTypeDef['typeDef']['unions']

export const petTypeDef = struct()
  .set('name', string)
  .set('alive', boolean)
  .set('species', speciesTypeDef)
  .narrow

export type MutablePet = ValueTypeOf<typeof petTypeDef>
export type Pet = ValueTypeOf<ReadonlyTypeDefOf<typeof petTypeDef>>
export type PetValuePaths = JsonPathsOf<typeof petTypeDef>
export type PetTypePaths = JsonPathsOf<typeof petTypeDef, '*'>
export type FlattenedPetTypeDefs = FlattenedTypeDefsOf<typeof petTypeDef, '*'>
export type FlattenedPetJsonValueToTypePaths = FlattenedJsonValueToTypePathsOf<typeof petTypeDef>
export type FlattenedPetValueTypes = FlattenedValueTypesOf<typeof petTypeDef>
export type FlattenedPetAccessors = FlattenedAccessorsOf<typeof petTypeDef>

export const NAME_TOO_SHORT_ERROR = 'name too short'
export const NOT_A_NUMBER_ERROR = 'not a number'
