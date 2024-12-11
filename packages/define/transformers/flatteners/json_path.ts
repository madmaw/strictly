export function jsonPath(prefix: string, segment: number | string, qualifier: string = ''): string {
  const s = `.${qualifier}${segment}`
  return `${prefix}${s}`
}

export function jsonPathPop(path: string): [string, string] | null {
  const parts = path.split('.')
  if (parts.length <= 1) {
    return null
  }
  return [
    parts.slice(0, -1).join('.'),
    parts.pop()!,
  ]
}
