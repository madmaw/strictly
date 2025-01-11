import { type UnionTypeDef } from './definitions'
import { type ReadonlyTypeOfType } from './readonly_type_of_type'
import { type ValueOfType } from './value_of_type'

// gets a record of the values types for a discriminated union mapped according to
// their discriminators
export type ValueTypesOfDiscriminatedUnion<
  U extends UnionTypeDef,
> = U extends UnionTypeDef<infer D, infer Unions> ? D extends string ? {
      [K in keyof Unions]: ValueOfType<ReadonlyTypeOfType<{ definition: Unions[K] }>> & {
        readonly [KD in D]: K
      }
    }
  : never
  : never
