import { DeterministicRandomPlugin } from 'test/plugins/DeterministicRandomPlugin'
import { MatchMediaPlugin } from 'test/plugins/MatchMediaPlugin'
import { ResizeObserverPlugin } from 'test/plugins/ResizeObserverPlugin'
import { type VitestPlugin } from 'test/VitestPlugin'

/**
 * Installs the shared test environment shims. Call from a vitest setup file
 */
export function installVitestPlugins() {
  // some plugins only work in the browser (or a DOM shim)
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
  const plugins: VitestPlugin[] = [new DeterministicRandomPlugin()]
  if (isBrowser) {
    plugins.push(new ResizeObserverPlugin(), new MatchMediaPlugin())
  }

  plugins.forEach(function (plugin) {
    const callbacks = plugin.install()

    beforeAll(async function () {
      await callbacks.beforeAll?.()
    })
    afterAll(async function () {
      await callbacks.afterAll?.()
    })
    beforeEach(async function () {
      await callbacks.beforeEach?.()
    })
    afterEach(async function () {
      await callbacks.afterEach?.()
    })
  })
}
