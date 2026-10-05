// oxlint-disable-next-line typescript/no-explicit-any
export function errorHandlingJsonParse<T = any>(
  json: string,
  errorHandler?: (e: unknown) => void,
): T | null {
  try {
    return JSON.parse(json) as T
  } catch (e) {
    errorHandler?.(e)
    return null
  }
}

// oxlint-disable-next-line typescript/no-explicit-any
export function errorHandlingJsonStringify<T = any>(
  v: T,
  errorHandler?: (e: unknown) => void,
) {
  try {
    return JSON.stringify(v)
  } catch (e) {
    errorHandler?.(e)
    return `unable to stringify type "${typeof v}"`
  }
}
