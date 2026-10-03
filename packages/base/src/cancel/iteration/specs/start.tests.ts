import {
  CancellableIterableCompletedError,
  CancellablePromise,
} from 'cancel/CancellablePromise'
import { start } from 'cancel/iteration/start'
import { delay } from 'util/delay'

describe('start', () => {
  it('resolves a value', async () => {
    expect(await start(1)).toEqual(1)
  })

  it('resolves a promise', async () => {
    expect(await start(CancellablePromise.resolve(1))).toEqual(1)
  })

  it('resolves a generator to its return value', async () => {
    function* step() {
      yield CancellablePromise.resolve('ignored')
      return 1
    }
    expect(await start(step())).toEqual(1)
  })

  it('starts a step from a factory', async () => {
    expect(await start(() => 1)).toEqual(1)
  })

  it('rejects when the factory throws', async () => {
    await expect(
      start(() => {
        throw new Error('factory failed')
      }),
    ).rejects.toThrow('factory failed')
  })

  it('rejects with a completion that escapes a generator', async () => {
    function* step(): Generator<CancellablePromise<never>, number> {
      yield CancellablePromise.reject(
        new CancellableIterableCompletedError('end'),
      )
      return 1
    }
    await expect(start(step())).rejects.toThrow(
      CancellableIterableCompletedError,
    )
  })

  it('cancels a generator step', async () => {
    const pending = CancellablePromise.infinite()
    function* step() {
      yield pending
    }
    const promise = start(step())
    await delay()
    promise.cancel()

    await expect(promise).rejects.toBeDefined()
    await expect(pending).rejects.toBeDefined()
  })
})
