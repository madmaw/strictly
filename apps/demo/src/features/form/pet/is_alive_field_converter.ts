import { valuePathToTypePath } from '@strictly/define'
import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from '@strictly/react-form'
import {
  type Pet,
  petType,
  type PetTypePaths,
} from './types'

const ALWAYS_MODIFIABLE = new Set<Extract<PetTypePaths, string>>(['$.alive'])

export class IsAliveTwoWayConverter<
  V,
  ValuePath extends string,
> implements TwoWayFieldConverter<V, V, never, ValuePath, Pet> {
  constructor() {
  }

  convert(value: V, valuePath: ValuePath, context: Pet): AnnotatedFieldConversion<V> {
    const typePath = valuePathToTypePath(petType, valuePath, true)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const readonly = !ALWAYS_MODIFIABLE.has(typePath as Extract<PetTypePaths, string>) && !context.alive
    return {
      value,
      required: false,
      readonly,
    }
  }

  revert(value: V): UnreliableFieldConversion<V, never> {
    return {
      type: UnreliableFieldConversionType.Success,
      value,
    }
  }
}
