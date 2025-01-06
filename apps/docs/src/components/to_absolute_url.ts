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
    if (path.indexOf('.') > path.lastIndexOf('/')) {
      if (absoluteUrl.endsWith('/')) {
        return absoluteUrl.substring(0, absoluteUrl.length - 1)
      }
    } else {
      if (!absoluteUrl.endsWith('/')) {
        return absoluteUrl + '/'
      }
    }
    return absoluteUrl
  }
}
