/**
 * The value paths that resolve to the given type path. This is the reverse lookup of a
 * `ValueToTypePathsOfType` map, computed on demand so callers never have to invert the map themselves.
 * A type path under a list or record can have many value paths (`$.tags.*` -> `$.tags.${number}`).
 * A map that is only an index signature (e.g. `Record<string, string>`) has no specific paths, so every
 * type path resolves to `string`
 */
export type ValuePathsOfTypePath<
  ValuePathsToTypePaths extends Readonly<Record<string, string>>,
  TypePath extends string,
> = string extends keyof ValuePathsToTypePaths
  ? string
  : {
      readonly [
        K in keyof ValuePathsToTypePaths & string
      ]: ValuePathsToTypePaths[K] extends TypePath ? K : never
    }[keyof ValuePathsToTypePaths & string]
