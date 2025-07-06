export type Delay = () => Promise<void>

export function createDelay(millis: number): Delay {
  return function () {
    return delay(millis)
  }
}

/**
 * creates a delay that blocks everything for the specified number of cold milliseconds initially, then
 * the warm millis thereafter
 * @param coldMillis the number of milliseconds to block initial delays for
 * @param warmMillis the number of milliseconds to block subsequent delays for
 * @returns a Promise that awaits for the specified time
 */
export function createWarmupDelay(coldMillis: number, warmMillis: number) {
  let warmup: Promise<void> | undefined
  return function () {
    if (warmup != null) {
      return warmup.then(function () {
        return delay(warmMillis)
      })
    } else {
      warmup = delay(coldMillis)
      return warmup
    }
  }
}

export function delay(millis: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, millis)
  })
}

export const secondDelay = createDelay(1000)
