export class UnreachableError extends Error {
  constructor(v: never) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    super(`Unreachable value received: ${v}`)
  }
}
