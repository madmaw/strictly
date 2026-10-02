export function expectEquals<V1, V2 extends V1>(
  v1: V1,
  v2: V2,
): asserts v1 is V2 {
  expect(v1).toEqual(v2)
}

export function expectTruthy(b: boolean): asserts b is true {
  expect(b).toBeTruthy()
}

export function expectDefined<V>(v: V): asserts v is NonNullable<V> {
  expect(v).toBeDefined()
}

export function expectInstanceOf<V1, V2 extends V1>(
  instance: V1,
  constructor: abstract new (...args: never[]) => V2,
): asserts instance is V2 {
  expect(instance).toBeInstanceOf(constructor)
}

export function expectDefinedAndReturn<V>(v: V): NonNullable<V> {
  expectDefined(v)
  return v
}

type PromiseState = 'fulfilled' | 'pending' | 'rejected'

function pendingAfter(milliseconds: number): Promise<PromiseState> {
  return new Promise((resolve) => {
    setTimeout(() => resolve('pending'), milliseconds)
  })
}

export async function expectPendingPromise<V>(
  p: Promise<V>,
  timeoutMilliseconds = 500,
) {
  const state = await Promise.race([
    p.then<PromiseState, PromiseState>(
      () => 'fulfilled',
      () => 'rejected',
    ),
    pendingAfter(timeoutMilliseconds),
  ])
  expect(state).toBe('pending')
}
