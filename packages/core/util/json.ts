// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandlingJsonParse<T = any>(json: string, errorHandler?: (e: unknown) => void): T | null {
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return JSON.parse(json) as T
  } catch (e) {
    errorHandler?.(e)
    return null
  }
}
