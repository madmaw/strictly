import { type IsEqual } from 'type-fest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsFieldReadonly<R extends Record<string, any>, K extends keyof R> = {
  [P in keyof R]: IsEqual<{ [Q in P]: R[P] }, { readonly [Q in P]: R[P] }>
}[K]

// extends never ? false : true
