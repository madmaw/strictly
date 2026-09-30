import { type FlattenedTypesOfType, type Type } from '@strictly/base'
import { type z } from 'zod'

export type ListValuePathsOfType<T extends Type> =
  keyof FlattenedListTypesOfType<T>

export type FlattenedListTypesOfType<T extends Type> =
  FlattenedListTypesOfTypes<FlattenedTypesOfType<T, null>>

type FlattenedListTypesOfTypes<T extends Readonly<Record<string, Type>>> = {
  [K in keyof T as T[K] extends z.ZodArray ? K : never]: T[K]
}
