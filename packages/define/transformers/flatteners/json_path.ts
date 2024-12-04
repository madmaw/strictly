export function jsonPath(prefix: string, segment: number | string, qualifier: string = ''): string {
  const s = `.${qualifier}${segment}`
  return `${prefix}${s}`
}
