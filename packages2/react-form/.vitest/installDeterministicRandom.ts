// sadly Mantine uses randomness to generate certain fields (e.g. label mappings), we
// override Math.random to ensure these seeds remain the same between runs
const originalMathRandom = Math.random

const LIMIT = 100

beforeEach(function () {
  let count = 0
  Math.random = function () {
    count++
    return (count % LIMIT) / LIMIT
  }
})

afterEach(function () {
  Math.random = originalMathRandom
})
