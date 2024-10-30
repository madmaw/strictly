export class UnreachableError extends Error {
  constructor(v: never) {
    super(`Unreacable value received: ${v}`)
  }
}
