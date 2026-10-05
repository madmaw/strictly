export type RequiredOfRecord<
  // oxlint-disable-next-line typescript/no-explicit-any -- any is needed for the generic constraints
  R extends Readonly<Record<string | number | symbol, any>>,
> = {
  [K in keyof R as undefined extends R[K] ? never : K]-?: NonNullable<R[K]>
}
