import ResizeObserver from 'resize-observer-polyfill'
import { type VitestPlugin } from 'test/VitestPlugin'

/**
 * Shims `ResizeObserver`, which is missing in jsdom
 */
export class ResizeObserverPlugin implements VitestPlugin {
  private static readonly originalResizeObserver:
    | typeof window.ResizeObserver
    | undefined = window.ResizeObserver

  install() {
    return {
      afterEach() {
        if (ResizeObserverPlugin.originalResizeObserver != null) {
          window.ResizeObserver = ResizeObserverPlugin.originalResizeObserver
        }
      },
      beforeEach() {
        // oxlint-disable-next-line typescript/no-unnecessary-condition -- jsdom does not implement ResizeObserver
        window.ResizeObserver ??= ResizeObserver
      },
    }
  }
}
