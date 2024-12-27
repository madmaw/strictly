import {
  type FlattenedTypeDefsOf,
  type ListTypeDef,
  type Type,
} from '@de/fine'
import { type SimplifyDeep } from 'type-fest'

export type ListJsonPathsOf<T extends Type> = keyof FlattenedListTypeDefsOf<T>

export type FlattenedListTypeDefsOf<T extends Type> = FlattenedListTypeDefsOfFlattened<
  // SimplifyDeep is necessary here otherwise FlattenedListTypeDefsOfFlattened will complain about infinite depth
  SimplifyDeep<FlattenedTypeDefsOf<T, null>>
>

type FlattenedListTypeDefsOfFlattened<T extends Readonly<Record<string, Type>>> = {
  [K in keyof T as T[K]['definition'] extends ListTypeDef ? K : never]: T[K]
}
