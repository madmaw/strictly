export function expectEquals<V1, V2 extends V1>(v1: V1, v2: V2): asserts v1 is V2 {
  expect(v1).toEqual(v2)
}

export function expectTruthy(b: boolean): asserts b is true {
  expect(b).toBeTruthy()
}

export function expectDefined<V>(v: V): asserts v is NonNullable<V> {
  expect(v).toBeDefined()
}

export function expectDefinedAndReturn<V>(v: V): NonNullable<V> {
  expectDefined(v)
  return v
}
