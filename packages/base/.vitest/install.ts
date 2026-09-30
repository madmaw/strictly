/* oxlint-disable typescript/no-unnecessary-condition -- these globals are typed as always present but are absent in the node test environment */
import { installVitestPlugins } from '@strictly/vite'

installVitestPlugins()

// the node test environment has no animation frame timer; the cancellable iterator paces its
// non-blocking loops with one, so fall back to a macrotask
globalThis.requestAnimationFrame ??= (cb) =>
  setTimeout(() => cb(performance.now()), 0) as unknown as number
globalThis.cancelAnimationFrame ??= (handle) => {
  clearTimeout(handle)
}
