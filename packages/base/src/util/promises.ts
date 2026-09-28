export function callAsPromise(
  f: (cb: (e?: unknown) => void) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    f((e?: unknown) => {
      if (e == null) {
        resolve()
      }
      reject(e)
    })
  })
}
