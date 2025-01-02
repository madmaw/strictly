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
    const unionTypeDef = union().add('0', numberType).add('1', nullType)
    const typeDef = object()
      .set('literal', numberType)
      .set('list', listTypeDef)
      .set('record', recordTypeDef)
      .set('object', objectTypeDef)
      .set('union', unionTypeDef)

    type F = FlattenedListTypesOfType<typeof typeDef>

    type E = {
      readonly '$.list': typeof listTypeDef.narrow,
    }

    expectTypeOf<F>().toEqualTypeOf<E>()
  })
})
