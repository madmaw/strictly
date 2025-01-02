import { type Type } from 'types/definitions'
import { type FlattenedValuesOfType } from 'types/flattened_values_of_type'
import { type Validator } from 'validation/validator'

export type FlattenedValidatorsOfType<
  T extends Type,
  FlattenedValueTypes extends FlattenedValuesOfType<T> = FlattenedValuesOfType<T>,
> = {
  readonly [
    K in keyof FlattenedValueTypes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]: Validator<FlattenedValueTypes[K], any>
}
