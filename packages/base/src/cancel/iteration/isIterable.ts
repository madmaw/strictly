/* oxlint-disable typescript/no-explicit-any -- generic type guard over arbitrary iterables */
export function isIterable(i: any): i is Iterable<any> {
  // horrid native types
  return i != null && (i as Partial<Iterable<any>>)[Symbol.iterator] != null
}
