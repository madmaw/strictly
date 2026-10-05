import { valuePathToTypePath } from '@strictly/base'
import {
  type AnnotatedFieldConversion,
  type TwoWayFieldConverter,
  type UnreliableFieldConversion,
  UnreliableFieldConversionType,
} from '@strictly/react'
import { type PetTypePaths, type PetValuePaths } from './fields'
import { petType, type PetValueToTypePaths } from './types'

const ALWAYS_MODIFIABLE = new Set<PetTypePaths>(['$.alive'])

export class IsAliveTwoWayConverter<
  // oxlint-disable-next-line typescript/no-explicit-any
  V = any,
> implements TwoWayFieldConverter<
  V,
  V,
  never,
  PetValuePaths,
  { alive: boolean }
> {
  convert(
    value: V,
    valuePath: PetValuePaths,
    { alive }: { alive: boolean },
  ): AnnotatedFieldConversion<V> {
    const typePath = valuePathToTypePath<PetValueToTypePaths, PetValuePaths>(
      petType,
      valuePath,
      true,
    )
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
