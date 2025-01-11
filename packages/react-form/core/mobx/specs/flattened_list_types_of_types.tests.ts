import {
  list,
  nullType,
  numberType,
  object,
  record,
  stringType,
  union,
} from '@strictly/define'
import {
  type FlattenedListTypesOfType,
} from 'core/mobx/flattened_list_types_of_type'

describe('FlattenedListTypesOfType', function () {
  it('filters lists types', function () {
    const listTypeDef = list(numberType)
    const recordTypeDef = record<typeof stringType, string>(stringType)
    const objectTypeDef = object()
    const unionTypeDef = union().or('0', numberType).or('1', nullType)
    const typeDef = object()
      .field('literal', numberType)
      .field('list', listTypeDef)
      .field('record', recordTypeDef)
      .field('object', objectTypeDef)
      .field('union', unionTypeDef)

    type F = FlattenedListTypesOfType<typeof typeDef>

    type E = {
      readonly '$.list': typeof listTypeDef.narrow,
    }

    expectTypeOf<F>().toEqualTypeOf<E>()
  })
})
