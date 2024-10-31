export type Just<T> = {
  value: T,
}
export type Nothing = null

export type Maybe<T> = Just<T> | Nothing

export type MaybePromise<T> = Promise<T> | T
