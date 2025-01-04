export type Reverse<
  R extends Readonly<Record<string | number | symbol, string | number | symbol>>,
> = {
  readonly [K in keyof R as R[K]]: K
}
