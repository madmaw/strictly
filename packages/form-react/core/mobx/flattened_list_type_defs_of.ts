import {
  type FlattenedTypeDefsOf,
  type ListTypeDef,
  type TypeDefHolder,
} from '@de/fine'
import { type SimplifyDeep } from 'type-fest'

export type FlattenedListTypeDefsOf<T extends TypeDefHolder> = FlattenedListTypeDefsOfFlattened<
  // SimplifyDeep is necessary here otherwise FlattenedListTypeDefsOfFlattened will complain about infinite depth
  SimplifyDeep<FlattenedTypeDefsOf<T, null>>
>

type FlattenedListTypeDefsOfFlattened<T extends Readonly<Record<string, TypeDefHolder>>> = {
  [K in keyof T as T[K]['typeDef'] extends ListTypeDef ? K : never]: T[K]
}
