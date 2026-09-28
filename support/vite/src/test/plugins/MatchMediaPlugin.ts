import { type VitestPlugin } from 'test/VitestPlugin'
import MatchMediaMockModule from 'vitest-matchmedia-mock'

// the mock is published as commonjs with an `exports.default`, which node unwraps but rolldown hands over as the
// whole module namespace when it pre-bundles for the browser
const MatchMediaMock: typeof MatchMediaMockModule =
  'default' in MatchMediaMockModule
    ? (MatchMediaMockModule as { default: typeof MatchMediaMockModule }).default
    : MatchMediaMockModule

/**
 * Shims `matchMedia`, which is missing in jsdom, with a fresh mock per test
 */
export class MatchMediaPlugin implements VitestPlugin {
  install() {
    let matchMediaMock: MatchMediaMockModule | undefined
    return {
      afterEach() {
        matchMediaMock?.destroy()
      },
      beforeEach() {
        matchMediaMock = new MatchMediaMock()
      },
    }
  }
}
