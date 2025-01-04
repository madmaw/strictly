export type Just<T> = readonly [T]

export type Nothing = null

export type Maybe<T> = Just<T> | Nothing
