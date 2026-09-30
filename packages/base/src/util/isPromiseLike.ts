export function isPromiseLike(v: unknown): v is PromiseLike<unknown> {
  return typeof (v as PromiseLike<unknown> | undefined)?.then === 'function'
}
