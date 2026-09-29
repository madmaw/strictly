import { type z } from 'zod'
import { type ReadonlyTypeOfType } from './ReadonlyTypeOfType'
import { type OptionsOfDiscriminatedUnion, type Type } from './Type'
import { type ValueOfType } from './ValueOfType'

// gets a record of the values types for a discriminated union mapped according to
// their discriminators
export type ValueTypesOfDiscriminatedUnion<U extends Type> =
  U extends z.ZodDiscriminatedUnion<infer Options, infer D>
    ? ValueTypesOfOptions<OptionsOfDiscriminatedUnion<Options, D>>
    : never

type ValueTypesOfOptions<Options> = {
  [K in keyof Options]: Options[K] extends Type
    ? ValueOfType<ReadonlyTypeOfType<Options[K]>>
    : never
}
