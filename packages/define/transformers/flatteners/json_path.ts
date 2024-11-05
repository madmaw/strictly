export function jsonPath(prefix: string, segment: number | string): string {
  const s = typeof segment === 'number' ? `[${segment}]` : `.${segment}`
  return `${prefix}${s}`
}
