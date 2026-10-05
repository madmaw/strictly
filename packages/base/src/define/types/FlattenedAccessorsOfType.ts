import { type FlattenedValuesOfType } from './FlattenedValuesOfType'
import { type Type } from './Type'

// oxlint-disable-next-line typescript/no-explicit-any
export type Accessor<T = any> = {
  readonly value: T
  set(v: T): void
}

export type FlattenedAccessorsOfType<
  T extends Type,
  Flattened extends Readonly<Record<string, unknown>> =
    FlattenedValuesOfType<T>,
> = {
  readonly [K in keyof Flattened]: Accessor<Flattened[K]>
}
