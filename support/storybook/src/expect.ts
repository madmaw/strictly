// oxlint-disable-next-line no-restricted-imports -- this module re-exports storybook's test assertions
import { expect } from 'storybook/test'

// storybook's `expect` types every matcher as promise-like so async DOM matchers can be awaited. These value
// assertions resolve synchronously and throw synchronously on failure, so the returned promise is voided to keep
// the assertion signatures (which cannot be async) intact.

export function expectEquals<V1, V2 extends V1>(
  v1: V1,
  v2: V2,
): asserts v1 is V2 {
  void expect(v1).toEqual(v2)
}

export function expectTruthy(b: boolean): asserts b is true {
  void expect(b).toBeTruthy()
}

export function expectDefined<V>(v: V): asserts v is NonNullable<V> {
  void expect(v).toBeDefined()
}

export function expectDefinedAndReturn<V>(v: V): NonNullable<V> {
  expectDefined(v)
  return v
}
