import { type CancellablePromiseDisposer } from 'cancel/Cancellable'
import { Cancellation } from 'cancel/CancellablePromise'
import { type CancellableGenerator } from 'cancel/iteration/CancellableGenerator'
import { isGenerator } from 'cancel/iteration/isGenerator'
import { runInAction } from 'mobx'
import { type Writable } from 'type-fest'
import { type Maybe } from 'types/Maybe'

function flowFactory(bound: boolean) {
  return <
    T,
    A extends unknown[],
    // oxlint-disable-next-line typescript/no-explicit-any -- any ok in generics
    G extends CancellableGenerator<any, unknown, CancellablePromiseDisposer>,
  >(
    target: (...a: A) => G,
    {
      addInitializer,
      name,
    }: ClassMethodDecoratorContext<T, (this: T, ...args: A) => G>,
  ) => {
    addInitializer(function (this: T) {
      const g = bound ? target.bind(this) : target
      this[name as keyof T] = function (this: T, ...args: A) {
        const iterator = g.call(this, ...args)
        return runGeneratorInAction(iterator)
      } as T[keyof T]
    })
  }
}

function* runGeneratorInAction<
  // oxlint-disable-next-line typescript/no-explicit-any -- any ok in generics
  G extends CancellableGenerator<any, unknown, CancellablePromiseDisposer>,
>(
  g: G,
): Generator<
  // types can be pretty loose in the return type as the caller doesn't care
  // about the type this method returns and inferring the type from `G` doesn't
  // assist with type safety internally
  // oxlint-disable-next-line typescript/no-explicit-any -- any ok in generics
  any,
  unknown,
  CancellablePromiseDisposer
> {
  const i = runInAction(() => g[Symbol.iterator]())
  let error: Maybe<unknown> = null
  let cancellerImpl: CancellablePromiseDisposer = () =>
    i.throw(new Cancellation())
  // hoist to provide a stable pointer to the implementation, which may vary
  const canceller = () => cancellerImpl()
  while (true) {
    const { done, value } = runInAction(() =>
      error == null ? i.next(canceller) : i.throw(error[0]),
    )
    if (done) {
      return value
    }
    try {
      // a yielded generator is a step in its own right, so it also needs to run in an action
      cancellerImpl = yield isGenerator(value)
        ? runGeneratorInAction(value)
        : value
      error = null
    } catch (e) {
      if (error === e) {
        throw e
      }
      error = [e]
    }
  }
}

type Flow = ReturnType<typeof flowFactory>

/**
 * Makes the attached generator run steps in an action. Does not change the type or behavior of the generator
 */
export const flow = flowFactory(false) as Flow & {
  readonly bound: Flow
}
;(flow as Writable<typeof flow>).bound = flowFactory(true)
