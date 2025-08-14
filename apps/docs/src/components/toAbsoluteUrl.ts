export type ToAbsoluteUrl = (path: string) => string

export function createToAbsoluteUrl(
  site: string,
  base: string,
  currentPath: string,
): ToAbsoluteUrl {
  const baseUrl = new URL(base.endsWith('/') ? base : base + '/', site)
  const pageUrl = new URL(currentPath, baseUrl)
  return function (path: string) {
    let absoluteUrl: string
    if (path.startsWith('/')) {
      absoluteUrl = new URL(path.substring(1), baseUrl).toString()
    } else {
      absoluteUrl = new URL(path, pageUrl).toString()
    }
    return absoluteUrl
  }
}
