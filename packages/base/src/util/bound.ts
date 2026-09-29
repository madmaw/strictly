/**
 * Method decorator that `bind`s the method to its containing instance, allowing you reference
 * the method without going through the instance.
 * e.g.
 * ```
 * class X {
 *   private a = 1
 *   @bound
 *   b() { return this.a++ }
 *   c() { return this.b() }
 * }
 *
 * const x = new X()
 * // works as usual
 * x.b()
 * const b = x.b
 * // also works
 * b()
 * const c = x.c
 * // breaks because c is not bound and has no relevant `this` pointer
 * c()
 * ```
 * credit goes to https://github.com/Alorel/bound-decorator
 */
export function bound<T, A extends unknown[], R>(
  target: (...a: A) => R,
  {
    addInitializer,
    name,
  }: ClassMethodDecoratorContext<T, (this: T, ...args: A) => R>,
) {
  addInitializer(function (this: T) {
    this[name as keyof T] = target.bind(this) as T[keyof T]
  })
}
