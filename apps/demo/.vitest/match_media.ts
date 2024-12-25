import MatchMediaMock from 'vitest-matchmedia-mock'

const matchMediaMock = new MatchMediaMock()

beforeAll(function () {
  matchMediaMock.clear()
})
