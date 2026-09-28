import ResizeObserver from 'resize-observer-polyfill'
import { type VitestPlugin } from 'test/VitestPlugin'

/**
 * Shims `ResizeObserver`, which is missing in jsdom
 */
export class ResizeObserverPlugin implements VitestPlugin {
  install() {
    // captured here rather than at module load so this file can be imported under plain node
    const originalResizeObserver: typeof window.ResizeObserver | undefined =
      window.ResizeObserver
    return {
      afterEach() {
        // oxlint-disable-next-line typescript/no-unnecessary-condition -- jsdom does not implement ResizeObserver
        if (originalResizeObserver != null) {
          window.ResizeObserver = originalResizeObserver
        }
      },
      beforeEach() {
        // oxlint-disable-next-line typescript/no-unnecessary-condition -- jsdom does not implement ResizeObserver
        window.ResizeObserver ??= ResizeObserver
      },
    }
  }
}
