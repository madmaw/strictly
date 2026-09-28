import { type VitestPlugin } from 'test/VitestPlugin'
import failOnConsole from 'vitest-fail-on-console'

type ConsoleMethod = 'assert' | 'debug' | 'error' | 'info' | 'log' | 'warn'

// messages that are allowed through, optionally restricted to a single console method
const ALLOWED_MESSAGES: readonly (readonly [ConsoleMethod | null, RegExp])[] = [
  // the storybook logger can log whatever it wants
  [null, /^SB\.*/],
]

/**
 * Fails any test that writes to the console. React reports invalid HTML, missing keys, act warnings and the like
 * through the console rather than throwing, so this turns those reports into test failures
 */
export class FailOnConsolePlugin implements VitestPlugin {
  install() {
    failOnConsole({
      allowMessage: (message: string, methodName: string) =>
        ALLOWED_MESSAGES.some(
          ([allowedMethod, regExp]) =>
            (allowedMethod == null || allowedMethod === methodName) &&
            regExp.test(message),
        ),
      shouldFailOnAssert: true,
      shouldFailOnDebug: true,
      shouldFailOnError: true,
      shouldFailOnInfo: true,
      shouldFailOnLog: true,
      shouldFailOnWarn: true,
      shouldPrintMessage: true,
    })
    return {}
  }
}
