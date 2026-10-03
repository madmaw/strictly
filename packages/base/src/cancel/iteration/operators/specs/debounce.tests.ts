/* oxlint-disable vitest/no-standalone-expect -- every test checks that no timers are left running */
import { CancellablePromise } from 'cancel/CancellablePromise'
import { auditTime } from 'cancel/iteration/operators/auditTime'
import { debounce } from 'cancel/iteration/operators/debounce'
import { filter } from 'cancel/iteration/operators/filter'
import { delay } from 'util/delay'
import { collectTimed, timedSource } from './sources'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })

  it('emits a value once nothing else arrives in time, and the most recent value when the source ends', async () => {
    // arrives at 0, 30, 60, 200 and 250, then ends
    const { isFinalized, source } = timedSource(
      [
        [0, 'a'],
        [30, 'b'],
        [30, 'c'],
        [140, 'd'],
        [50, 'e'],
      ],
      'end',
    )
    expect(await collectTimed(debounce(source, 100))).toEqual({
      returnValue: 'end',
      values: [
        [160, 'c'],
        [250, 'e'],
      ],
    })
    expect(isFinalized()).toBe(true)
  })

  it('ends without emitting when the source is empty', async () => {
    const { source } = timedSource([], 'end')
    expect(await collectTimed(debounce(source, 100))).toEqual({
      returnValue: 'end',
      values: [],
    })
  })

  it('keeps a pull that is still pending when the wait ends', async () => {
    // arrives at 0 and 150, so the second pull is pending when the first wait ends at 100
    const { source } = timedSource(
      [
        [0, 'a'],
        [150, 'b'],
      ],
      'end',
    )
    expect(await collectTimed(debounce(source, 100))).toEqual({
      returnValue: 'end',
      values: [
        [100, 'a'],
        [150, 'b'],
      ],
    })
  })

  it('composes with operators that emit generator steps', async () => {
    // arrives at 0, 30, 60, 200 and 250, with 'b' filtered out
    const { source } = timedSource(
      [
        [0, 'a'],
        [30, 'b'],
        [30, 'c'],
        [140, 'd'],
        [50, 'e'],
      ],
      'end',
    )
    expect(
      await collectTimed(
        debounce(
          filter(source, (v) => v !== 'b'),
          100,
        ),
      ),
    ).toEqual({
      returnValue: 'end',
      values: [
        [160, 'c'],
        [250, 'e'],
      ],
    })
  })

  it('composes with other timed operators', async () => {
    // arrives at 0, 30, 60, 200 and 250, which auditing emits as 'b' at 40, 'c' at 100, 'd' at 240 and 'e' at 290
    const { source } = timedSource(
      [
        [0, 'a'],
        [30, 'b'],
        [30, 'c'],
        [140, 'd'],
        [50, 'e'],
      ],
      'end',
    )
    expect(await collectTimed(debounce(auditTime(source, 40), 100))).toEqual({
      returnValue: 'end',
      values: [
        [200, 'c'],
        [290, 'e'],
      ],
    })
  })

  it('passes on errors from the source', async () => {
    function* source() {
      yield CancellablePromise.resolve('a')
      yield CancellablePromise.reject<string>(new Error('source failed'))
    }
    await expect(collectTimed(debounce(source(), 100))).rejects.toThrow(
      'source failed',
    )
  })

  it('cancels a pull that is held between emissions', async () => {
    const { isFinalized, source } = timedSource(
      [
        [0, 'a'],
        [1000, 'b'],
      ],
      'end',
    )
    // the consumer is still handling 'a' when the iteration is cancelled, so nothing is waiting on the pull for 'b'
    const promise = CancellablePromise.fromIterable(debounce(source, 100), {
      blocking: true,
      consumer: () => delay(500),
    })
    await vi.advanceTimersByTimeAsync(200)
    promise.cancel()

    await expect(promise).rejects.toBeDefined()
    expect(isFinalized()).toBe(true)
  })

  it('cancels the pending pull and the wait', async () => {
    const { isFinalized, source } = timedSource(
      [
        [0, 'a'],
        [1000, 'b'],
      ],
      'end',
    )
    const consumer = vi.fn()
    const promise = CancellablePromise.fromIterable(debounce(source, 100), {
      blocking: true,
      consumer,
    })
    await vi.advanceTimersByTimeAsync(50)
    promise.cancel()

    await expect(promise).rejects.toBeDefined()
    expect(consumer).not.toHaveBeenCalled()
    expect(isFinalized()).toBe(true)
  })
})
