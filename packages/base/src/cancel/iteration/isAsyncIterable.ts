/* oxlint-disable typescript/no-explicit-any -- generic type guard over arbitrary async iterables */
export function isAsyncIterable(i: any): i is AsyncIterable<any> {
  // horrid native types
  return (
    i != null &&
    (i as Partial<AsyncIterable<any>>)[Symbol.asyncIterator] != null
  )
}
