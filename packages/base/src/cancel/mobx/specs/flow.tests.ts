/* oxlint-disable vitest/no-standalone-expect -- assertions run inside generator methods exercised by the tests */
import type { CancellablePromiseDisposer } from 'cancel/Cancellable'
import { CancellablePromise, Cancellation } from 'cancel/CancellablePromise'
import { wait } from 'cancel/iteration/wait'
import {
  _getGlobalState,
  type IReactionDisposer,
  observableRef,
  reaction,
} from 'mobx'
import { delay } from 'util/delay'
import { flow } from '../flow'

function inAction() {
  const globalState: { inBatch: number } = _getGlobalState()
  return globalState.inBatch > 0
}

class Model {
  private canceller: CancellablePromiseDisposer | undefined

  @observableRef
  accessor thing = 0;

  @flow
  *asyncFlow() {
    expect(inAction()).toBeTruthy()
    this.thing++
    yield delay()
    expect(inAction()).toBeTruthy()
    this.thing++
    yield this.thing
    yield delay()
    this.thing++

    return inAction()
  }

  @flow.bound
  *boundAsyncFlow() {
    expect(inAction()).toBeTruthy()
    return yield* this.asyncFlow()
  }

  *noFlow() {
    expect(inAction()).toBeFalsy()
    // because we run tests in mobx strict mode, we cannot modify `thing`, but
    // we can check the action context
    yield inAction()
    return inAction()
  }

  @flow
  *flow() {
    expect(inAction()).toBeTruthy()
    yield this.thing++
    yield this.thing++
    yield this.thing++
    yield this.thing++
    return inAction()
  }

  @flow
  *errorFlow() {
    try {
      this.thing++
      yield delay()
      throw new Error('hello')
    } catch (e) {
      this.thing++
      return e instanceof Error && inAction() ? e.message : null
    }
  }

  @flow
  *stepFlow() {
    const isStepInAction = yield* wait(() => this.step())
    return isStepInAction && inAction()
  }

  *step() {
    yield delay()
    this.thing++
    return inAction()
  }

  @flow
  *cancellableInfiniteFlow() {
    this.canceller = yield
    yield CancellablePromise.infinite()
  }

  cancelInfiniteFlow() {
    this.canceller?.()
  }
}

describe('flow', () => {
  let model: Model
  let updates: number[]
  let disposer: IReactionDisposer
  let isInAction: boolean
  beforeEach(() => {
    model = new Model()
    updates = []
    disposer = reaction(
      () => model.thing,
      (update) => {
        updates.push(update)
      },
    )
  })

  afterEach(() => {
    disposer()
  })

  describe('asyncFlow', () => {
    beforeEach(async () => {
      isInAction = await CancellablePromise.fromCancellable(model.asyncFlow())
    })

    it('updates the value', () => {
      expect(model.thing).toEqual(3)
    })

    it('fires reactions', () => {
      expect(updates).toEqual([1, 2, 3])
    })

    it('is running in an action', () => {
      expect(isInAction).toBeTruthy()
    })
  })

  describe('boundAsyncFlow', () => {
    beforeEach(async () => {
      const flow = model.boundAsyncFlow
      isInAction = await CancellablePromise.fromCancellable(flow())
    })

    it('updates the value', () => {
      expect(model.thing).toEqual(3)
    })

    it('fires reactions', () => {
      expect(updates).toEqual([1, 2, 3])
    })

    it('is running in an action', () => {
      expect(isInAction).toBeTruthy()
    })
  })

  describe('flow', () => {
    beforeEach(async () => {
      isInAction = await CancellablePromise.fromCancellable(model.flow())
    })

    it('updates the value', () => {
      expect(model.thing).toEqual(4)
    })

    it('fires reactions', () => {
      expect(updates).toEqual([1, 2, 3, 4])
    })

    it('is running in an action', () => {
      expect(isInAction).toBeTruthy()
    })
  })

  describe('errorFlow', () => {
    let result: string | null
    beforeEach(async () => {
      result = await CancellablePromise.fromCancellable(model.errorFlow())
    })

    it('updates the value', () => {
      expect(model.thing).toEqual(2)
    })

    it('fires reactions', () => {
      expect(updates).toEqual([1, 2])
    })

    it('returns the error message', () => {
      expect(result).toEqual('hello')
    })
  })

  describe('stepFlow', () => {
    beforeEach(async () => {
      isInAction = await CancellablePromise.fromCancellable(model.stepFlow())
    })

    it('updates the value', () => {
      expect(model.thing).toEqual(1)
    })

    it('runs the step in an action', () => {
      expect(isInAction).toBeTruthy()
    })
  })

  describe('noFlow', () => {
    beforeEach(async () => {
      isInAction = await CancellablePromise.fromCancellable(model.noFlow())
    })

    it('is does not run in an action', () => {
      expect(isInAction).toBeFalsy()
    })
  })

  describe('cancellableInfiniteFlow', () => {
    it('supports cancels', async () => {
      const promise = CancellablePromise.fromCancellable(
        model.cancellableInfiniteFlow(),
      )
      // brief delay to make sure the iterator is underway
      await delay()
      model.cancelInfiniteFlow()
      await expect(promise).rejects.toThrow(Cancellation)
    })
  })
})
