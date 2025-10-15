import { when } from 'mobx'

/**
 * Used for when you want to look at the value of an observable without observing it (or triggering
 * the mobx runtime linter)
 */
export function peek<T>(operation: () => T): T {
  let result: T
  // when will make mobx think we are observing the value
  void when(() => {
    // trick mobx runtime linting
    result = operation()
    return true
  })
  // biome-ignore lint/style/noNonNullAssertion: the result is always there
  return result!
}
