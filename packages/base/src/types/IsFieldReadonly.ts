import { type IsEqual } from 'type-fest'

export type IsFieldReadonly<
  // oxlint-disable-next-line typescript/no-explicit-any -- any is needed for the generic constraints
  R extends Record<string, any>,
  K extends keyof R,
> = {
  [P in keyof R]: IsEqual<{ [Q in P]: R[P] }, { readonly [Q in P]: R[P] }>
}[K]

// extends never ? false : true
