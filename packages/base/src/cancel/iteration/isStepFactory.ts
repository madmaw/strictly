export function isStepFactory<S>(step: S | (() => S)): step is () => S {
  return typeof step === 'function' && step.length === 0
}
