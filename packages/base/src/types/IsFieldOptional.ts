export type IsFieldOptional<
  // oxlint-disable-next-line typescript/no-explicit-any -- any is needed for the generic constraints
  R extends Record<string, any>,
  K extends keyof R,
> = undefined extends R[K]
  ? // yes, we can't use the `extends` as true/false directly
    true
  : false
