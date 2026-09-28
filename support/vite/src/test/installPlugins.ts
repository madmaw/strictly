import { DeterministicRandomPlugin } from 'test/plugins/DeterministicRandomPlugin'
import { FailOnConsolePlugin } from 'test/plugins/FailOnConsolePlugin'
import { MatchMediaPlugin } from 'test/plugins/MatchMediaPlugin'
import { ResizeObserverPlugin } from 'test/plugins/ResizeObserverPlugin'
import { type VitestPlugin } from 'test/VitestPlugin'

/**
 * Installs the shared test environment shims. Call from a vitest setup file
 */
export function installVitestPlugins() {
  // some plugins only work in the browser (or a DOM shim)
  // via globalThis so the lookup does not throw under plain node, where window is not declared
  // oxlint-disable-next-line typescript/no-unnecessary-condition -- window does not exist under node
  const isBrowser = typeof globalThis.window?.document !== 'undefined'
  const plugins: VitestPlugin[] = [
    new DeterministicRandomPlugin(),
    new FailOnConsolePlugin(),
  ]
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
