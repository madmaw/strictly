// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsFieldOptional<R extends Record<string, any>, K extends keyof R> = undefined extends R[K]
  // yes, we can't use the `extends` as true/false directly
  ? true
  : false
