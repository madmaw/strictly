export class UnexpectedImplementationError extends Error {
  constructor(impl: string) {
    super(impl)
  }
}
