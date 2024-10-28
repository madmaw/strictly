import { type ReadonlyRecord } from 'util/record'

export type Accessor<T> = {
  get(): T,
  set(v: T): void,
}

// TS doesn't like this
// export type FlattenedAccessorsOf<T extends TypeDef> = Accessor<InternalFlattenValueTypesOf<FlattenedTypeDefsOf<T, null>>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FlattenedAccessorsOf<R extends ReadonlyRecord<string, any>> = {
  [K in keyof R]: Accessor<R[K]>
}
