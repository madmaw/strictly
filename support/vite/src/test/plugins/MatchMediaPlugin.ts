import { type VitestPlugin } from 'test/VitestPlugin'
import MatchMediaMock from 'vitest-matchmedia-mock'

/**
 * Shims `matchMedia`, which is missing in jsdom, with a fresh mock per test
 */
export class MatchMediaPlugin implements VitestPlugin {
  install() {
    let matchMediaMock: MatchMediaMock | undefined
    return {
      afterEach: function () {
        matchMediaMock?.destroy()
      },
      beforeEach: function () {
        matchMediaMock = new MatchMediaMock()
      },
    }
  }
}
