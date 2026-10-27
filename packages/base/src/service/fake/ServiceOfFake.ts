import { type CancellablePromise } from 'cancel/CancellablePromise'
import {
  asyncToCancellableIterable,
  type CancellableIterable,
} from 'cancel/iteration/CancellableIterable'
import { isAsyncIterable } from 'cancel/iteration/isAsyncIterable'
import { type Simplify } from 'type-fest'
import { createDelay, type Delay, delay as delayImpl } from 'util/delay'
import { isPromiseLike } from 'util/isPromiseLike'

// oxlint-disable-next-line typescript/no-explicit-any -- any is fine in generics
type Any = any

// do not make system methods async
const IGNORE = new Set<PropertyKey>(
  Object.getOwnPropertyNames(Object.prototype),
)

// unfortunately we have to return an `AsyncIterable` from the fake services (as opposed to a `CancellableIterable`)
// because if we return an `Iterable` of any kind, it's very hard to detect what's a `CancellableIterable` and what's
// just an array being returned (arrays are also iterable)
export type AsyncIterableWithCancel<T = Any, TReturn = Any, TNext = Any> = {
  readonly iterable: AsyncIterable<T, TReturn, TNext>
  readonly cancel: () => void
}

function isAsyncIterableWithCancel(v: unknown): v is AsyncIterableWithCancel {
  return (
    v != null &&
    isAsyncIterable((v as Partial<AsyncIterableWithCancel>).iterable) &&
    typeof (v as AsyncIterableWithCancel).cancel === 'function'
  )
}

type AnyOperation<P extends Any[] = Any[], R = Any> = (...p: P) => R

type ServiceOperationOfFake<P extends Any[] = Any[], R = Any> = (
  ...p: P
) => R extends Promise<Any>
  ? R
  : R extends AsyncIterableWithCancel<infer IV, infer IR>
    ? CancellableIterable<IV, IR>
    : CancellablePromise<R>

export type WithPending<T> = T & {
  /**
   * Resolves once every call made to the service, including calls made while waiting, has settled
   */
  readonly pending: Promise<void>
}

/**
 * Converts the operations of a fake service so that synchronous results are returned in a CancellablePromise after
 * a delay, and AsyncIterableWithCancels are returned as CancellableIterables
 */
export type ServiceOfFake<S> = Simplify<
  WithPending<{
    [k in keyof S]: S[k] extends AnyOperation<infer P, infer R>
      ? ServiceOperationOfFake<P, R>
      : S[k]
  }>
>

type FakeOperationOfService<P extends Any[] = Any[], R = Any> = (
  ...p: P
) => R extends Promise<infer A>
  ? A | R
  : R extends CancellableIterable<infer IV, void>
    ? AsyncIterableWithCancel<IV, void>
    : R

/**
 * The inverse of ServiceOfFake. Keeps only the asynchronous operations of the service, allowing them to return their
 * results synchronously, and CancellableIterables as AsyncIterableWithCancels. Useful as an interface to implement
 * when writing a fake implementation of a service
 */
export type FakeOfService<S> = FakeOfSimplifiedService<Simplify<S>>

type FakeOfSimplifiedService<S> = {
  [
    k in keyof S as S[k] extends AnyOperation<infer _P, infer R>
      ? R extends Promise<Any> | CancellableIterable<Any>
        ? k
        : never
      : never
  ]: S[k] extends AnyOperation<infer P, infer R>
    ? FakeOperationOfService<P, R>
    : S[k]
}

function maybeServiceOperationOfFake<S>(
  service: S,
  prop: keyof S,
  delay: Delay,
): ServiceOperationOfFake | null {
  const callee = service[prop]
  if (typeof callee !== 'function' || IGNORE.has(prop)) {
    return null
  }
  return (...args) => {
    try {
      const result: unknown = callee.apply(service, args)
      if (isAsyncIterableWithCancel(result)) {
        return asyncToCancellableIterable(result.iterable, () =>
          result.cancel(),
        )
      }
      if (isPromiseLike(result)) {
        // Do not add additional delays if the result is already a promise. We don't want
        // these fake delays to cascade into excessively long delays when fake services
        // call each other
        return result
      }
      return delay().then(() => result)
    } catch (e) {
      // assume the error is intentional and throw it after a delay
      return delay().then(() => {
        throw e
      })
    }
  }
}

/**
 * Creates a proxy of a fake service, converting it to a service whose operations return cancellable promises and
 * cancellable iterables
 * @param service the fake implementation to use
 * @param delay the delay applied to synchronous results
 */
export function serviceOfFake<S>(
  service: S,
  delay: Delay = createDelay(400),
): ServiceOfFake<S> {
  const pendingPromises: unknown[] = []
  async function awaitAllMaybePromises() {
    let promises: unknown[]
    do {
      // Add an additional short delay so the render loop can run
      // at least once both before and after any service calls. Any
      // service calls triggered during the delay will also be awaited
      // until there are no service calls
      await delayImpl(100)
      promises = pendingPromises.splice(0, pendingPromises.length)
      await Promise.allSettled(promises)
    } while (promises.length > 0)
  }

  const methods = new Map<PropertyKey, ServiceOperationOfFake>()

  return new Proxy<ServiceOfFake<S>>(service as ServiceOfFake<S>, {
    get(_target, p, receiver) {
      if (p === 'pending') {
        return awaitAllMaybePromises()
      }
      const cached = methods.get(p)
      if (cached != null) {
        return cached
      }
      const method = maybeServiceOperationOfFake(service, p as keyof S, delay)
      if (method == null) {
        return Reflect.get(service as object, p, receiver)
      }
      const pendingMethod: ServiceOperationOfFake = (...args) => {
        const result = method(...args)
        pendingPromises.push(result)
        return result
      }
      methods.set(p, pendingMethod)
      return pendingMethod
    },
  })
}
