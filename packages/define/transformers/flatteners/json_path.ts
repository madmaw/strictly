import {
  assertEqual,
  assertState,
  type StringConcatOf,
} from '@strictly/base'

export function jsonPath<
  Prefix extends string,
  Segment extends number | string,
>(prefix: Prefix, segment: Segment): `${Prefix}.${Segment}`
export function jsonPath<
  Prefix extends string,
  Segment extends number | string,
  Qualifier extends string,
>(prefix: Prefix, segment: Segment, qualifier: Qualifier): `${Prefix}${Qualifier}.${Segment}`
export function jsonPath<
  Prefix extends string,
  Segment extends number | string,
  Qualifier extends string = '',
>(prefix: Prefix, segment: Segment, qualifier?: Qualifier) {
  const s = `.${segment}`
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return `${prefix}${qualifier ?? ''}${s}` as `${Prefix}${Qualifier}.${Segment}`
}

// TODO type safety
export function jsonPathPop<Path extends string>(path: Path): [string, string] | null {
  const parts = path.split('.')
  if (parts.length <= 1) {
    return null
  }
  return [
    parts.slice(0, -1).join('.'),
    parts.pop()!,
  ]
}

export function jsonPathPrefix<
  Prefix extends string,
  Path extends string,
>(prefix: Prefix, path: Path): Path extends StringConcatOf<'$', infer ToMount> ? `${Prefix}${ToMount}` : never {
  assertEqual(path[0], '$', '{} should start with $', path)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return `${prefix}${path.slice(1)}` as Path extends StringConcatOf<'$', infer ToMount> ? `${Prefix}${ToMount}` : never
}

export function jsonPathUnprefix<
  Prefix extends string,
  Path extends string,
>(prefix: Prefix, path: Path): Path extends StringConcatOf<Prefix, infer ToUnmount> ? `$${ToUnmount}` : never {
  assertState(path.startsWith(prefix), '{} should start with {}', path, prefix)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return `$${path.slice(prefix.length)}` as Path extends StringConcatOf<Prefix, infer ToUnmount> ? `$${ToUnmount}`
    : never
}
