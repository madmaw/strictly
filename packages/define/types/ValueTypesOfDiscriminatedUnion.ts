import { type ReadonlyTypeOfType } from './ReadonlyTypeOfType'
import { type UnionTypeDef } from './Type'
import { type ValueOfType } from './ValueOfType'

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
