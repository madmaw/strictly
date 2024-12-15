import { type SafeFieldConverter } from 'types/field_converters'

export function listConverter<
  E,
  K extends string,
  ValuePath extends string,
>(): SafeFieldConverter<readonly E[], K[], ValuePath> {
  return function (from: readonly E[], valuePath: ValuePath) {
    return from.map(function (_v, i) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return `${valuePath as string}.${i}` as K
    })
  }
}
