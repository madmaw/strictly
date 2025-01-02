import {
  type FlattenedTypesOfType,
  type ListTypeDef,
  type Type,
} from '@strictly/define'
import { type SimplifyDeep } from 'type-fest'

export type ListValuePathsOfType<T extends Type> = keyof FlattenedListTypesOfType<T>

export type FlattenedListTypesOfType<T extends Type> = FlattenedListTypesOfTypes<
  // SimplifyDeep is necessary here otherwise FlattenedListTypeDefsOfFlattened will complain about infinite depth
  SimplifyDeep<FlattenedTypesOfType<T, null>>
>

type FlattenedListTypesOfTypes<T extends Readonly<Record<string, Type>>> = {
  [K in keyof T as T[K]['definition'] extends ListTypeDef ? K : never]: T[K]
}
