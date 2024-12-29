export type ToAbsoluteUrl = (path: string) => string

export function createToAbsoluteUrl(
  site: string,
  base: string,
  currentPath: string,
): ToAbsoluteUrl {
  const baseUrl = new URL(base.endsWith('/') ? base : base + '/', site)
  const pageUrl = new URL(currentPath, baseUrl)
  return function (path: string) {
    if (path.startsWith('/')) {
      return new URL(path.substring(1), baseUrl).toString()
    }
    return new URL(path, pageUrl).toString()
  }
}
