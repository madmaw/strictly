import {
  list,
  nullType,
  numberType,
  object,
  record,
  stringType,
  union,
} from '@de/fine'
import {
  type FlattenedListTypeDefsOf,
} from 'core/mobx/flattened_list_type_defs_of'

describe('FlattenedListTypeDefsOf', function () {
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

    type F = FlattenedListTypeDefsOf<typeof typeDef>

    type E = {
      readonly '$.list': typeof listTypeDef.narrow,
    }

    expectTypeOf<F>().toEqualTypeOf<E>()
  })
})
