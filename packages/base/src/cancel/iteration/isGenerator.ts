// oxlint-disable-next-line typescript/no-explicit-any -- generic type guard over arbitrary generators
export function isGenerator(g: any): g is Generator<unknown, unknown, any> {
  const candidate = g as
    // oxlint-disable-next-line typescript/no-explicit-any -- generic type guard over arbitrary generators
    Partial<Generator<unknown, unknown, any>> | null | undefined
  return (
    typeof candidate?.next === 'function' &&
    typeof candidate.throw === 'function' &&
    typeof candidate[Symbol.iterator] === 'function'
  )
}
