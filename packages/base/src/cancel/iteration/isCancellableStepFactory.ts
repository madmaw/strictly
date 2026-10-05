import { type CancellableStep } from 'cancel/iteration/CancellableGenerator'

export function isCancellableStepFactory<T>(
  step: CancellableStep<T> | (() => CancellableStep<T> | T) | T,
): step is () => CancellableStep<T> | T {
  return typeof step === 'function' && step.length === 0
}
