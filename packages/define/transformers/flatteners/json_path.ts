export function jsonPath(prefix: string, segment: number | string, qualifier: string = ''): string {
  const s = typeof segment === 'number' ? `[${segment}]` : `.${qualifier}${segment}`
  return `${prefix}${s}`
}
