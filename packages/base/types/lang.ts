export type MaybeReadonly<T, R extends boolean> = R extends true ? Readonly<T> : T
export type MaybeReadonlyArray<E, R extends boolean> = R extends true ? readonly E[] : E[]

export type MaybePartial<T, P extends boolean> = P extends true ? Partial<T> : T
