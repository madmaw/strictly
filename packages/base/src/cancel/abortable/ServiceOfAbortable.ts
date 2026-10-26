import { type StreamedValue } from 'cancel/abortable/StreamedValue'
import { CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableIterable } from 'cancel/iteration/CancellableIterable'
import { UnexpectedImplementationError } from 'errors/UnexpectedImplementation'
import { UnreachableError } from 'errors/Unreachable'
import { type Simplify } from 'type-fest'
import { delay as delayImpl } from 'util/delay'

export type AbortOptions = {
  readonly signal: AbortSignal
  readonly timeoutMs: number | undefined
}

type StreamedValueWithDone<T, TReturn> =
  | StreamedValue<T>
  | {
      readonly type: 'done'
      readonly value: TReturn
    }

const RETRY_SYMBOL = Symbol('retry')
const UNARY_SYMBOL = Symbol('unary')
const STREAMING_SYMBOL = Symbol('streaming')
const INITIAL_IDLE_TIMEOUT_SYMBOL = Symbol('initialIdleTimeout')

type Annotations = Partial<{
  [RETRY_SYMBOL]: boolean
  [UNARY_SYMBOL]: boolean
  [STREAMING_SYMBOL]: boolean
  [INITIAL_IDLE_TIMEOUT_SYMBOL]: number | undefined
}>

/**
 * Marks a method that returns a Promise as an operation to be wrapped by `serviceOfAbortable`
 */
// oxlint-disable-next-line typescript/no-explicit-any -- any is fine in generics
export function unary<A extends any[]>({
  retry = false,
  initialIdleTimeout,
}: {
  readonly retry?: boolean
  /**
   * Overrides the service-wide `RetryOptions.initialIdleTimeout` for this operation
   */
  readonly initialIdleTimeout?: number
} = {}): (target: UnaryAbortableOperation<A>) => void {
  return (target) => {
    Object.assign(target, {
      [RETRY_SYMBOL]: retry,
      [UNARY_SYMBOL]: true,
      [INITIAL_IDLE_TIMEOUT_SYMBOL]: initialIdleTimeout,
    } satisfies Annotations)
  }
}

/**
 * Marks a method that returns an AsyncIterable as an operation to be wrapped by `serviceOfAbortable`
 */
export function streaming(): (target: StreamingAbortableOperation) => void {
  return (target) => {
    Object.assign(target, {
      [STREAMING_SYMBOL]: true,
    } satisfies Annotations)
  }
}

function getAnnotations<S extends AbortableService>(
  service: S,
  prop: keyof S,
): Annotations {
  // the proxy is asked for props that do not exist on the service
  return (service[prop] as Annotations | undefined) ?? {}
}

// oxlint-disable-next-line typescript/no-explicit-any -- any is fine in generics
type Any = any

/**
 * An operation that returns a Promise or an AsyncIterable and takes AbortSignal and timeout parameters
 */
type AbortableOperation<
  P extends Any[] = Any[],
  R extends Promise<Any> | AsyncIterable<Any> =
    | Promise<Any>
    | AsyncIterable<Any>,
> = (options: AbortOptions, ...p: P) => R

type UnaryAbortableOperation<
  P extends Any[] = Any[],
  R extends Promise<Any> = Promise<Any>,
> = (options: AbortOptions, ...p: P) => R

type StreamingAbortableOperation<
  P extends Any[] = Any[],
  R extends AsyncIterable<Any> = AsyncIterable<Any>,
> = (options: AbortOptions, ...p: P) => R

/**
 * An interface that exclusively contains AbortableOperations
 */
type AbortableService<K extends PropertyKey = Any> = Record<
  K,
  AbortableOperation
>

type ServiceOperationOfAbortable<P extends Any[] = Any[], R = Any> = (
  ...p: P
) => R extends CancellablePromise<Any>
  ? R
  : R extends Promise<infer V>
    ? CancellablePromise<V>
    : R extends AsyncIterable<infer T, infer TReturn, infer TNext>
      ? CancellableIterable<StreamedValue<T>, TReturn, TNext>
      : R

type ServiceOperation<
  P extends Any[] = Any[],
  R extends
    | CancellablePromise<Any>
    | Iterable<CancellablePromise<StreamedValue<Any>>> =
    | CancellablePromise<Any>
    | Iterable<Any>,
> = (...p: P) => R

/**
 * Removes the AbortOptions parameter from each AbortableOperation of the service, converting Promise return types
 * to CancellablePromises and AsyncIterables to retrying CancellableIterables
 */
export type ServiceOfAbortable<S> = {
  [k in keyof S]: S[k] extends AbortableOperation<infer P, infer R>
    ? ServiceOperationOfAbortable<P, R>
    : S[k]
}

type ValueOfStreamedValue<SV> =
  SV extends StreamedValue<infer V> ? (unknown extends V ? never : V) : never

/**
 * The inverse of ServiceOfAbortable. Re-adds the AbortOptions parameter to each operation and converts
 * CancellablePromise return types back to Promises, and CancellableIterables back to AsyncIterables. Useful as
 * an interface to implement when writing an abortable implementation of a service
 */
export type AbortableOfService<S> = AbortableOfSimplifiedService<Simplify<S>>

type AbortableOfSimplifiedService<S> = {
  [k in keyof S]: S[k] extends ServiceOperation<infer P, infer R>
    ? R extends CancellablePromise<infer T>
      ? AbortableOperation<P, Promise<T>>
      : R extends Iterable<infer CP, infer TReturn, infer TNext>
        ? CP extends Promise<infer SV>
          ? AbortableOperation<
              P,
              AsyncIterable<ValueOfStreamedValue<SV>, TReturn, TNext>
            >
          : S[k]
        : S[k]
    : S[k]
}

function maybeServiceOperationOfAbortable<S extends AbortableService>(
  service: S,
  prop: keyof S,
  serviceOptions: RetryOptions,
): ServiceOperationOfAbortable | null {
  const {
    [RETRY_SYMBOL]: retryable = false,
    [UNARY_SYMBOL]: unary = false,
    [STREAMING_SYMBOL]: streaming = false,
    [INITIAL_IDLE_TIMEOUT_SYMBOL]: initialIdleTimeout,
  } = getAnnotations(service, prop)
  if (!unary && !streaming) {
    return null
  }
  const options =
    initialIdleTimeout == null
      ? serviceOptions
      : { ...serviceOptions, initialIdleTimeout }
  const name = String(prop)

  return (...args) => {
    function call(controller: AbortController, timeoutMs: number) {
      return service[prop](
        {
          signal: controller.signal,
          timeoutMs,
        },
        ...args,
      )
    }

    if (unary) {
      return retryUnary(
        name,
        call as (
          controller: AbortController,
          timeoutMs: number,
        ) => Promise<Any>,
        retryable,
        options,
      )
    }
    return retryStreaming(
      name,
      call as (
        controller: AbortController,
        timeoutMs: number,
      ) => AsyncIterable<Any>,
      options,
    )
  }
}

// allow the server time to respond to the request being killed
const MIN_RETRY_INTERVAL_MS = 5_000
const DEFAULT_IDLE_TIMEOUT_MS = 60_000
const DEFAULT_TIMEOUT_BACKOFF_MULTIPLIER = 1.2
const DEFAULT_MAX_STREAMING_RETRIES = null
const DEFAULT_MAX_UNARY_RETRIES = 2
const DEFAULT_STREAM_LIFESPAN_TIMEOUT = 5 * 60 * 1000

export type RetryOptions = {
  /**
   * The maximum amount of time (in milliseconds) that the server can maintain a streaming connection
   */
  readonly streamLifespanTimeout?: number
  /**
   * The amount of time we are willing to wait for an operation (streaming or unary) to respond
   * before we kill it
   */
  readonly initialIdleTimeout?: number
  readonly timeoutBackoffMultiplier?: number
  readonly maxStreamingRetries?: number | null
  /**
   * Exits the stream when it finishes instead of retrying the stream. Probably shouldn't
   * be used directly (in production you never want a stream to exit), but used internally
   * and for testing
   */
  readonly __exitStreamingOnDone?: boolean
  readonly maxUnaryRetries?: number
  readonly makeRetryable?: (e: unknown) => CancellablePromise<boolean> | boolean
  readonly delay?: (millis: number) => CancellablePromise<void>
  readonly onDiscardError?: (e: unknown, name: string, attempt: number) => void
}

export class IdleTimeoutError extends Error {
  constructor(name: string) {
    super(`network idle timeout failed to trigger: ${name}`)
  }
}

class UnexpectedStreamTerminationError extends Error {
  constructor(name: string) {
    super(`a stream we assumed was infinite reported it was done: ${name}`)
  }
}

function isInternallyRetryable(e: unknown) {
  return (
    e instanceof IdleTimeoutError ||
    e instanceof UnexpectedStreamTerminationError
  )
}

function retryUnary<T>(
  name: string,
  call: (abortController: AbortController, timeout: number) => Promise<T>,
  retryable: boolean,
  options: RetryOptions,
): CancellablePromise<T> {
  const { onDiscardError, maxUnaryRetries = DEFAULT_MAX_UNARY_RETRIES } =
    options

  // use the streaming retry logic to retry the unary request, that way we keep DRY
  const iterable = retryStreaming<never, T>(
    name,
    (abortController: AbortController, timeout: number) => {
      const promise = call(abortController, timeout)
      return {
        [Symbol.asyncIterator]: () => ({
          next: async () => ({ done: true, value: await promise }),
        }),
      }
    },
    {
      ...options,
      __exitStreamingOnDone: true,
      // override since we are using the streaming iterator to retry unary queries
      maxStreamingRetries: retryable ? maxUnaryRetries : 0,
      // it will use the idle timeout if the lifespan is less than the time
      streamLifespanTimeout: 0,
    },
  )
  let currentPromise:
    | CancellablePromise<StreamedValueWithDone<never, T>>
    | undefined
  return new CancellablePromise(
    (async (): Promise<T> => {
      const iterator = iterable[Symbol.iterator]()
      for (;;) {
        const { done, value: promiseOrReturnValue } = iterator.next()
        if (done) {
          // should never happen, should always get a "done" value before the
          // iterator returns, but will allow it rather than put in an assert
          return promiseOrReturnValue
        }
        currentPromise = promiseOrReturnValue
        const value = await promiseOrReturnValue

        switch (value.type) {
          case 'value':
            throw new UnexpectedImplementationError(
              `unary operation ${name} yielded a value`,
            )
          case 'done':
            return value.value
          case 'error':
            onDiscardError?.(value.error, name, value.attempt)
            break
          case 'retry':
            break
          default:
            throw new UnreachableError(value)
        }
      }
    })(),
    () => currentPromise?.cancel(),
  )
}

/**
 * Yields the promise and returns what it resolved to. Unlike `wait`, the yielded value is the promise itself, as
 * it is consumed by whatever is iterating rather than by a driver
 */
function* yieldResolved<V>(
  promise: CancellablePromise<V>,
): Generator<CancellablePromise<V>, V> {
  let result: V | undefined
  yield promise.then((v) => {
    result = v
    return v
  })
  return result as V
}

function* retryStreaming<T, TReturn>(
  name: string,
  call: (
    abortController: AbortController,
    timeout: number,
  ) => AsyncIterable<T, TReturn>,
  {
    timeoutBackoffMultiplier = DEFAULT_TIMEOUT_BACKOFF_MULTIPLIER,
    maxStreamingRetries: maxRetries = DEFAULT_MAX_STREAMING_RETRIES,
    streamLifespanTimeout = DEFAULT_STREAM_LIFESPAN_TIMEOUT,
    initialIdleTimeout = DEFAULT_IDLE_TIMEOUT_MS,
    makeRetryable,
    delay = delayImpl,
    onDiscardError,
    __exitStreamingOnDone: exitStreamingOnDone = false,
  }: RetryOptions,
): CancellableIterable<StreamedValueWithDone<T, TReturn>, TReturn> {
  let abortController = new AbortController()
  let previousAbortController = abortController
  let idleTimeout = initialIdleTimeout
  let retries = 0
  let events = 0
  let requestTime: number
  let stream = call(
    abortController,
    Math.max(idleTimeout, streamLifespanTimeout),
  )
  for (;;) {
    try {
      const connectTime = Date.now()
      const iterator = stream[Symbol.asyncIterator]()
      const activeStream = stream
      do {
        requestTime = Date.now()
        const promise = new CancellablePromise(iterator.next(), () => {
          abortController.abort()
        })

        const streamed = CancellablePromise.raceAndCancelLosers([
          promise,
          CancellablePromise.delay(idleTimeout + 100).then(() => {
            // force the request to exit if the timeout doesn't trigger after a small grace
            // period
            const error = new IdleTimeoutError(name)
            abortController.abort(error)
            throw error
          }),
        ])
          .then(({ value, done }) => {
            if (!done) {
              return {
                type: 'value',
                value,
              } as const
            }
            if (exitStreamingOnDone) {
              return {
                type: 'done',
                value,
              } as const
            }
            // force a retry
            throw new UnexpectedStreamTerminationError(name)
          })
          .catch((error: unknown) => {
            const connectionDuration = Date.now() - connectTime
            const streamedError = {
              attempt: retries,
              connectionDuration,
              error,
              events,
              timeout: idleTimeout,
              type: 'error',
            } as const
            if (maxRetries != null && retries >= maxRetries) {
              throw error
            }
            if (isInternallyRetryable(error)) {
              return streamedError
            }
            if (makeRetryable == null) {
              throw error
            }
            return CancellablePromise.fromCancellable(makeRetryable(error))
              .catch((error: unknown) => {
                // if the check fails, then treat it as being retryable
                // report the retry failing somewhere
                onDiscardError?.(error, name, retries)
                return true
              })
              .then((retryable) => {
                if (retryable) {
                  return streamedError
                }
                throw error
              })
          })
        const value = yield* yieldResolved(streamed)
        switch (value.type) {
          case 'error':
            // await the remaining time if the request finished early
            yield delay(
              Math.max(
                MIN_RETRY_INTERVAL_MS,
                idleTimeout - (Date.now() - requestTime),
              ),
            ).then(() => {
              idleTimeout = Math.ceil(idleTimeout * timeoutBackoffMultiplier)
              retries++
              abortController = new AbortController()
              stream = call(
                abortController,
                Math.max(idleTimeout, streamLifespanTimeout),
              )
              const previousEvents = events
              events = 0
              return {
                attempts: retries,
                previousEvents,
                timeout: idleTimeout,
                type: 'retry',
              } as const
            })
            break
          case 'done':
            return value.value
          case 'value':
            // reset the timeout
            idleTimeout = initialIdleTimeout
            retries = 0
            events++
            break
          default:
            throw new UnreachableError(value)
        }
        // if the stream has been recreated, exit the loop
        // oxlint-disable-next-line no-unmodified-loop-condition -- stream is reassigned inside the retry promise callback
      } while (activeStream === stream)
    } finally {
      previousAbortController.abort()
      previousAbortController = abortController
    }
  }
}

/**
 * Creates a proxy of a service whose operations take explicit abort and timeout parameters, converting it to a
 * service whose operations return cancellable promises and retrying cancellable iterables
 * @param service the implementation to use
 * @param options various options for retrying operations
 */
export function serviceOfAbortable<S>(
  service: S,
  options: RetryOptions = {},
): ServiceOfAbortable<S> {
  const methods: Partial<Record<string | symbol, ServiceOperationOfAbortable>> =
    {}
  return new Proxy<ServiceOfAbortable<S>>(service as ServiceOfAbortable<S>, {
    get(target, p, receiver) {
      const method =
        methods[p] ??
        maybeServiceOperationOfAbortable(
          service as AbortableService,
          p,
          options,
        )
      if (method != null) {
        methods[p] = method
        return method
      }
      return Reflect.get(target, p, receiver)
    },
  })
}
