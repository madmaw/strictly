// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequiredOfRecord<R extends Readonly<Record<string | number | symbol, any>>> = {
  [K in keyof R as undefined extends R[K] ? never : K]-?: NonNullable<R[K]>
}
