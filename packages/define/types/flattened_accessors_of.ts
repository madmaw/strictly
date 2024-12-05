import { type TypeDefHolder } from './definitions'
import { type FlattenedValueTypesOf } from './flattened_value_types_of'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Accessor<T = any> = {
  readonly value: T,
  set(v: T): void,
}

export type FlattenedAccessorsOf<
  T extends TypeDefHolder,
  Flattened extends Readonly<Record<string, Accessor>> = FlattenedValueTypesOf<T>,
> = {
  readonly [K in keyof Flattened]: Accessor<Flattened[K]>
}
