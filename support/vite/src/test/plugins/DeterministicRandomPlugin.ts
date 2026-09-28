import { type VitestPlugin } from 'test/VitestPlugin'

const LIMIT = 100

// sadly Mantine uses randomness to generate certain fields (e.g. label mappings), we
// override Math.random to ensure these seeds remain the same between runs
export class DeterministicRandomPlugin implements VitestPlugin {
  private static readonly originalMathRandom = Math.random

  install() {
    return {
      afterEach() {
        Math.random = DeterministicRandomPlugin.originalMathRandom
      },
      beforeEach() {
        let count = 0
        Math.random = function () {
          count++
          return (count % LIMIT) / LIMIT
        }
      },
    }
  }
}
