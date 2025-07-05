import { valuePathToTypePath } from '@strictly/define'
import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from '@strictly/react-form'
import {
  type PetTypePaths,
  type PetValuePaths,
} from './Fields'
import {
  petType,
  type PetValueToTypePaths,
} from './Types'

const ALWAYS_MODIFIABLE = new Set<PetTypePaths>(['$.alive'])

export class IsAliveTwoWayConverter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V = any,
> implements TwoWayFieldConverter<V, V, never, PetValuePaths, { alive: boolean }> {
  constructor() {
  }

  convert(value: V, valuePath: PetValuePaths, { alive }: { alive: boolean }): AnnotatedFieldConversion<V> {
    const typePath = valuePathToTypePath<PetValueToTypePaths, PetValuePaths>(petType, valuePath, true)
    const readonly = !ALWAYS_MODIFIABLE.has(typePath) && !alive
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
