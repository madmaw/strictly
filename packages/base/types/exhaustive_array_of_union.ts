import { type ElementOfArray } from './element_of_array'
import { type PrintableOf } from './printable_of'

export type ExhaustiveArrayOfUnion<UnionType, Tuple extends readonly UnionType[]> =
  Exclude<UnionType, ElementOfArray<Tuple>> extends never ? Tuple
    : never

export type FriendlyExhaustiveArrayOfUnion<UnionType, Tuple extends readonly UnionType[]> =
  Exclude<UnionType, ElementOfArray<Tuple>> extends never ? Tuple
    : `${PrintableOf<Exclude<UnionType, ElementOfArray<Tuple>>>} missing from array`
