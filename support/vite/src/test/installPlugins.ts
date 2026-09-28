import { DeterministicRandomPlugin } from 'test/plugins/DeterministicRandomPlugin'
import { MatchMediaPlugin } from 'test/plugins/MatchMediaPlugin'
import { ResizeObserverPlugin } from 'test/plugins/ResizeObserverPlugin'
import { type VitestPlugin } from 'test/VitestPlugin'

/**
 * Installs the shared test environment shims. Call from a vitest setup file
 */
export function installVitestPlugins() {
  // some plugins only work in the browser (or a DOM shim)
  // oxlint-disable-next-line typescript/no-unnecessary-condition -- window does not exist under node
  const isBrowser = typeof window?.document !== 'undefined'
  const plugins: VitestPlugin[] = [new DeterministicRandomPlugin()]
  if (isBrowser) {
    plugins.push(new ResizeObserverPlugin(), new MatchMediaPlugin())
  }

  plugins.forEach((plugin) => {
    const callbacks = plugin.install()

    beforeAll(async () => {
      await callbacks.beforeAll?.()
    })
    afterAll(async () => {
      await callbacks.afterAll?.()
    })
    beforeEach(async () => {
      await callbacks.beforeEach?.()
    })
    afterEach(async () => {
      await callbacks.afterEach?.()
    })
  })
}
