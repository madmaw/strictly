import { type ElementOfArray } from './element_of_array'

export type ExhaustiveArrayOfUnion<UnionType, Tuple extends readonly UnionType[]> =
  Exclude<UnionType, ElementOfArray<Tuple>> extends never ? Tuple
    : never
