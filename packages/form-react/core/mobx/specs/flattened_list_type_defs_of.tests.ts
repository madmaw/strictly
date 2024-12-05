import {
  list,
  map,
  nullTypeDefHolder,
  number,
  string,
  struct,
  union,
} from '@de/fine'
import {
  type FlattenedListTypeDefsOf,
} from 'core/mobx/flattened_list_type_defs_of'

describe('FlattenedListTypeDefsOf', function () {
  it('filters lists types', function () {
    const listTypeDef = list(number)
    const mapTypeDef = map<typeof string, string>(string)
    const structTypeDef = struct()
    const unionTypeDef = union().add('0', number).add('1', nullTypeDefHolder)
    const typeDef = struct()
      .set('literal', number)
      .set('list', listTypeDef)
      .set('map', mapTypeDef)
      .set('struct', structTypeDef)
      .set('union', unionTypeDef)

    type F = FlattenedListTypeDefsOf<typeof typeDef>

    type E = {
      readonly '$.list': typeof listTypeDef.narrow,
    }

    expectTypeOf<F>().toEqualTypeOf<E>()
  })
})
