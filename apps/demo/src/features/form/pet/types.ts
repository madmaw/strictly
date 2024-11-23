import {
  boolean,
  type FlattenedAccessorsOf,
  type FlattenedJsonValueToTypePathsOf,
  type FlattenedValueTypesOf,
  type ReadonlyTypeDefOf,
  string,
  struct,
  type ValueTypeOf,
} from '@de/fine'
import { type JsonPathsOf } from '@de/fine/types/json_paths_of'
import { type FormField } from '@de/form-react'

export const petTypeDef = struct()
  .set('name', string)
  .set('alive', boolean)
  .narrow

export type MutablePet = ValueTypeOf<typeof petTypeDef>
export type Pet = ValueTypeOf<ReadonlyTypeDefOf<typeof petTypeDef>>
export type PetValuePaths = JsonPathsOf<typeof petTypeDef>
export type PetTypePaths = JsonPathsOf<typeof petTypeDef, '*'>
export type FlattenedPetJsonValueToTypePaths = FlattenedJsonValueToTypePathsOf<typeof petTypeDef>
export type FlattenedPetValueTypes = FlattenedValueTypesOf<typeof petTypeDef>
export type FlattenedPetAccessors = FlattenedAccessorsOf<typeof petTypeDef>

export type PetFormFields = {
  '$.name': FormField<string, string>,
  '$.alive': FormField<string, boolean>,
}

export const NAME_TOO_SHORT_ERROR = 'name too short'
