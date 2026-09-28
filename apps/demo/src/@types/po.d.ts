// .po catalogs are compiled on the fly by @lingui/vite-plugin, so there are no generated locale sources to type
declare module '*.po' {
  export const messages: Record<string, string>
}
