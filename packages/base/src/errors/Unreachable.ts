import { errorHandlingJsonStringify } from 'util/json'

export class UnreachableError extends Error {
  constructor(readonly v: never) {
    super(`Unreachable value received: ${errorHandlingJsonStringify(v)}`)
  }
}
