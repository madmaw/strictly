import { type Field } from 'types/field'
import {
  type FieldConverter,
} from 'types/field_converter'
import { type FieldValueFactory } from 'types/field_value_factory'

export class ListConverter<E, K extends string>
  implements FieldConverter<never, Record<string, Field>, E[], readonly K[]>,
    FieldValueFactory<Record<string, Field>, E[]>
{
  revert(to: E[], valuePath: string): readonly K[] {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return to.map(function (_v, i) {
      return `${valuePath}.${i}`
    }) as K[]
  }

  create(): E[] {
    return []
  }
}
