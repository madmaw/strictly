import { type AnnotatedFieldConverter } from 'types/field_converters'

export function listConverter<
  E,
  K extends string,
  ValuePath extends string,
  Context,
>(): AnnotatedFieldConverter<readonly E[], K[], ValuePath, Context> {
  return function (from: readonly E[], valuePath: ValuePath) {
    const value = from.map(function (_v, i) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return `${valuePath as string}.${i}` as K
    })
    return {
      value,
      required: false,
    }
  }
}
