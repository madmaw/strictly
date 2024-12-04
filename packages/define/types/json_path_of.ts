export type JsonPathOf<
  Prefix extends string,
  Accessor extends string | number | symbol,
  SegmentOverride extends string | null = null,
> = SegmentOverride extends string ? `${Prefix}.${SegmentOverride}`
  : Accessor extends string | number ? `${Prefix}.${Accessor}`
  : never
