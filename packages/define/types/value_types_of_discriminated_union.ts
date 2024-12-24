import { type UnionTypeDef } from './definitions'
import { type ValueTypeOf } from './value_type_of'

// gets a record of the values types for a discriminated union mapped according to
// their discriminators
export type ValueTypesOfDiscriminatedUnion<
  U extends UnionTypeDef,
> = U extends UnionTypeDef<infer D, infer Unions> ? D extends string ? {
      [K in keyof Unions]: ValueTypeOf<{ definition: Unions[K] }> & {
        [KD in D]: K
      }
    }
  : never
  : never
