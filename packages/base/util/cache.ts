import { type Maybe } from 'types/maybe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CacheValueFactory<A extends any[], V> = {
  (...args: A): V,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Cache<A extends any[], V> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly cache: Map<any, V> = new Map()

  constructor(private readonly valueFactory: CacheValueFactory<A, V>) {
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private retrieveFinalMap(...args: A): Map<any, V> {
    return args.slice(0, -1).reduce(function (cache, key) {
      let map = cache.get(key)
      if (map == null) {
        map = new Map()
        cache.set(key, map)
      }
      return map
    }, this.cache)
  }

  retrieve(...args: A): Maybe<V> {
    const finalKey = args[args.length - 1]
    const finalMap = this.retrieveFinalMap(...args)
    if (!finalMap.has(finalKey)) {
      return null
    }
    return [finalMap.get(finalKey)!]
  }

  retrieveOrCreate(...args: A): V {
    const finalKey = args[args.length - 1]
    const finalMap = this.retrieveFinalMap(...args)
    if (finalMap == null || !finalMap.has(finalKey)) {
      const value = this.valueFactory(...args)
      finalMap.set(finalKey, value)
    }
    return finalMap.get(finalKey)!
  }

  clear(...args: A) {
    const finalKey = args[args.length - 1]
    const finalMap = this.retrieveFinalMap(...args)
    finalMap.delete(finalKey)
  }
}
