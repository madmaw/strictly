import {
  list,
  nullTypeDefHolder,
  number,
  object,
  record,
  string,
  union,
} from '@de/fine'
import {
  type FlattenedListTypeDefsOf,
} from 'core/mobx/flattened_list_type_defs_of'

describe('FlattenedListTypeDefsOf', function () {
  it('filters lists types', function () {
    const listTypeDef = list(number)
    const recordTypeDef = record<typeof string, string>(string)
    const objectTypeDef = object()
    const unionTypeDef = union().add('0', number).add('1', nullTypeDefHolder)
    const typeDef = object()
      .set('literal', number)
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
