import { type FlattenedValuesOfType } from './FlattenedValuesOfType'
import { type Type } from './Type'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Accessor<T = any> = {
  readonly value: T,
  set(v: T): void,
}

export type FlattenedAccessorsOfType<
  T extends Type,
  Flattened extends Readonly<Record<string, Accessor>> = FlattenedValuesOfType<T>,
> = {
  readonly [K in keyof Flattened]: Accessor<Flattened[K]>
}
