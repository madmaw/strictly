export function jsonPath(prefix: string, index: number): string
export function jsonPath(prefix: string, attribute: string): string
export function jsonPath(prefix: string, segment: number | string): string {
  const s = typeof segment === 'number' ? `[${segment}]` : `.${segment}`
  return `${prefix}${s}`
}
