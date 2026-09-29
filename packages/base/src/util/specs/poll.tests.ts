import { type Maybe } from 'types/Maybe'
import { constantPollInterval, poll } from 'util/poll'
import { type Mock, vi } from 'vite-plus/test'

describe('poll', () => {
  const pollInterval = constantPollInterval(1)
  let callee: Mock<() => Promise<Maybe<number>>>

  beforeEach(() => {
    callee = vi.fn()
  })

  it('returns the success value', async () => {
    const value = 1
    callee.mockResolvedValueOnce([value])
    const result = await poll(callee, {
      pollInterval,
    })
    expect(result).toEqual([value])
    expect(callee).toHaveBeenCalledTimes(1)
  })

  it('returns the success value after a retry', async () => {
    const value = 1
    callee.mockResolvedValueOnce(null)
    callee.mockResolvedValueOnce([value])
    const result = await poll(callee, {
      pollInterval,
      retries: 2,
    })
    expect(result).toEqual([value])
    expect(callee).toHaveBeenCalledTimes(2)
  })

  it('returns null when polling result not available after retries', async () => {
    callee.mockResolvedValue(null)
    const retries = 4
    const result = await poll(callee, {
      pollInterval,
      retries,
    })
    expect(result).toBe(null)
    expect(callee).toHaveBeenCalledTimes(retries)
  })

  it('reports errors immediately', async () => {
    const error = new Error()
    callee.mockRejectedValue(error)

    await expect(
      poll(callee, {
        pollInterval,
      }),
    ).rejects.toBe(error)
    expect(callee).toHaveBeenCalledTimes(1)
  })
})
