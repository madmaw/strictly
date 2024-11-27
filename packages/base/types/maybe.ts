export const nothing = Symbol('nothing')

export type Just<T> = T
export type Nothing = typeof nothing

export type Maybe<T> = Just<T> | Nothing
