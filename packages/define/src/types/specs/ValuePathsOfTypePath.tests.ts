import { list, numberType, object, stringType, union } from 'types/builders'
import { type ValuePathsOfTypePath } from 'types/ValuePathsOfTypePath'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'

describe('ValuePathsOfTypePath', () => {
  const t = object()
    .field('name', stringType)
    .field('tags', list(numberType))
    .field(
      'species',
      union('type')
        .or('dog', object().field('barks', numberType))
        .or('cat', object().field('meows', numberType)),
    ).narrow
  type M = ValueToTypePathsOfType<typeof t>

  it('resolves a plain path to itself', () => {
    expectTypeOf<ValuePathsOfTypePath<M, '$.name'>>().toEqualTypeOf<'$.name'>()
  })

  it('resolves a list element to the indexed value path', () => {
    expectTypeOf<
      ValuePathsOfTypePath<M, '$.tags.*'>
    >().toEqualTypeOf<`$.tags.${number}`>()
  })

  it('resolves a discriminated union member', () => {
    expectTypeOf<
      ValuePathsOfTypePath<M, '$.species:dog.barks'>
    >().toEqualTypeOf<'$.species:dog.barks'>()
  })

  it('resolves a union of type paths to the union of value paths', () => {
    expectTypeOf<
      ValuePathsOfTypePath<M, '$.name' | '$.tags.*'>
    >().toEqualTypeOf<'$.name' | `$.tags.${number}`>()
  })

  it('resolves an unknown type path to never', () => {
    expectTypeOf<ValuePathsOfTypePath<M, '$.missing'>>().toEqualTypeOf<never>()
  })

  it('resolves to string when the map is an index signature', () => {
    expectTypeOf<
      ValuePathsOfTypePath<Record<string, string>, '$.name'>
    >().toEqualTypeOf<string>()
  })
})
