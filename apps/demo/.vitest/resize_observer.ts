import ResizeObserver from 'resize-observer-polyfill'

beforeAll(function () {
  window.ResizeObserver = window.ResizeObserver || ResizeObserver
})
