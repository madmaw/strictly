// absolute import beaks the docs app build
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { errorHandlingJsonStringify } from '../util/json'

export class UnreachableError extends Error {
  constructor(readonly v: never) {
    super(`Unreachable value received: ${errorHandlingJsonStringify(v)}`)
  }
}
