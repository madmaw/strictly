import { CancellablePromise } from 'cancel/CancellablePromise'
import { type CancellableIterable } from 'cancel/iteration/CancellableIterable'
import {
  type AsyncIterableWithCancel,
  type FakeOfService,
  type ServiceOfFake,
  serviceOfFake,
} from 'service/fake/ServiceOfFake'
import { type Mock } from 'vite-plus/test'

describe('Fake', () => {
  describe('FakeOfService', () => {
    interface Service {
      doUnsupportedThing(n: number): number
      doThing(n: number): Promise<number[]>
      doCancellableThing(n: number): CancellablePromise<number>
      doIterableThing(): CancellableIterable<number, void>
    }

    type T = FakeOfService<Service>

    it('equals expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<{
        doThing(n: number): number[] | Promise<number[]>
        doCancellableThing(n: number): number | CancellablePromise<number>
        doIterableThing(): AsyncIterableWithCancel<number, void>
      }>()
    })
  })

  describe('ServiceOfFake', () => {
    let mockDoThing: Mock<FakeService['doThing']>
    let mockDoAsyncThing: Mock<FakeService['doAsyncThing']>
    let mockDoCancellableAsyncThing: Mock<
      FakeService['doCancellableAsyncThing']
    >
    let mockDoAsyncIterableThing: Mock<FakeService['doAsyncIterableThing']>
    let mockCancel: Mock<() => void>

    class FakeService {
      doThing(n: number): number {
        return mockDoThing(n)
      }

      doAsyncThing(n: number): Promise<number> {
        return mockDoAsyncThing(n)
      }

      doCancellableAsyncThing(n: number): CancellablePromise<number> {
        return mockDoCancellableAsyncThing(n)
      }

      doAsyncIterableThing(): AsyncIterableWithCancel<number, void> {
        return mockDoAsyncIterableThing()
      }
    }
    beforeEach(() => {
      mockDoThing = vi.fn().mockReturnValue(1)
      mockDoAsyncThing = vi.fn().mockResolvedValue(2)
      mockDoCancellableAsyncThing = vi
        .fn()
        .mockReturnValue(CancellablePromise.resolve(3))
      mockCancel = vi.fn()
      mockDoAsyncIterableThing = vi.fn().mockImplementation(() => ({
        cancel: mockCancel,
        iterable: (async function* () {
          for (const value of [1, 2, 4, 8]) {
            yield await Promise.resolve(value)
          }
        })(),
      }))
    })

    type T = ServiceOfFake<FakeService>

    it('equals expected type', () => {
      expectTypeOf<T>().toEqualTypeOf<{
        readonly pending: Promise<void>
        doThing(n: number): CancellablePromise<number>
        doAsyncThing(n: number): Promise<number>
        doCancellableAsyncThing(n: number): CancellablePromise<number>
        doAsyncIterableThing(): CancellableIterable<number, void>
      }>()
    })

    describe('serviceOfFake', () => {
      let delayService: T
      let delay: Mock<() => CancellablePromise<void>>
      beforeEach(() => {
        delay = vi.fn().mockImplementation(() => CancellablePromise.resolve())
        delayService = serviceOfFake(new FakeService(), delay)

        expect(delay).not.toHaveBeenCalled()
      })

      it('calls through to doThing and introduces a delay', async () => {
        const value = 100
        mockDoThing.mockReturnValue(value)
        const result = await delayService.doThing(1)

        expect(result).toBe(value)
        expect(mockDoThing).toHaveBeenCalledExactlyOnceWith(1)
        expect(delay).toHaveBeenCalledOnce()
      })

      it('throws a delayed error if the fake service throws an error', async () => {
        mockDoThing.mockImplementationOnce(() => {
          throw new Error('fake failure')
        })
        const promise = delayService.doThing(1)

        await expect(promise).rejects.toThrow('fake failure')
        expect(mockDoThing).toHaveBeenCalledExactlyOnceWith(1)
        expect(delay).toHaveBeenCalledOnce()
      })

      it('calls through to doAsyncThing', async () => {
        const value = 100
        mockDoAsyncThing.mockResolvedValueOnce(value)
        const result = await delayService.doAsyncThing(1)

        expect(result).toBe(value)
        expect(mockDoAsyncThing).toHaveBeenCalledExactlyOnceWith(1)
        expect(delay).not.toHaveBeenCalled()
      })

      it('calls through to doAsyncIterableThing and converts to a CancellableIterable', async () => {
        const iterable = delayService.doAsyncIterableThing()
        const result = await CancellablePromise.valuesFromIterable(iterable)

        expect(mockDoAsyncIterableThing).toHaveBeenCalledExactlyOnceWith()
        expect(result.values).toEqual([1, 2, 4, 8])
        expect(delay).not.toHaveBeenCalled()
      })

      it('cancels the AsyncIterableWithCancel when a pulled value is cancelled', () => {
        const iterable = delayService.doAsyncIterableThing()
        const [first] = iterable
        first.cancel()

        expect(mockCancel).toHaveBeenCalledOnce()
      })

      it('does not delay Object.prototype methods', () => {
        const service: object = delayService
        expect(service.valueOf()).toBe(service)
      })

      it('resolves pending once outstanding calls have settled', async () => {
        let settled = false
        void delayService.doThing(1).then(() => {
          settled = true
        })
        await delayService.pending

        expect(settled).toBe(true)
      })
    })
  })
})
