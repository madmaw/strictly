// oxlint-disable-next-line typescript/no-explicit-any -- generic type guard over arbitrary iterables
export function isIterable(i: any): i is Iterable<any> {
  // horrid native types
  // oxlint-disable-next-line typescript/no-explicit-any -- generic type guard over arbitrary iterables
  return i != null && (i as Partial<Iterable<any>>)[Symbol.iterator] != null
}
