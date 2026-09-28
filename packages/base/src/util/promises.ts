export function callAsPromise(f: (cb: (e?: unknown) => void) => void): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    f(function (e?: unknown) {
      if (e == null) {
        resolve()
      }
      reject(e)
    })
  })
}
