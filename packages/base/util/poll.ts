import {
  type Maybe,
  nothing,
} from 'types/maybe'
import { delay } from './delay'

export function constantPollInterval(delay: number) {
  return function () {
    return delay
  }
}

type PollOptions = {
  pollInterval?: (retries: number) => number,
  retries?: number,
}

export async function poll<T>(
  f: () => Promise<Maybe<T>>,
  {
    pollInterval = constantPollInterval(200),
    retries = 3,
  }: PollOptions = {},
): Promise<Maybe<T>> {
  let retriesRemaining = retries
  while (retriesRemaining > 0) {
    await delay(pollInterval(retriesRemaining))
    retriesRemaining--
    const v = await f()
    if (v !== nothing) {
      return v
    }
  }
  return nothing
}

// TODO
// function createPoll<P, T>(
//   p: (params: P) => Promise<Maybe<T>>,
//   options: PollOptions,
// ): (params: P) => Promise<Maybe<T>>;
