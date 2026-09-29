import { type IsFieldReadonly, type Reverse } from '@strictly/base'
import { copy } from 'transformers/copies/copy'
import { mobxCopy } from 'transformers/copies/mobxCopy'
import { equals } from 'transformers/equals'
import { flattenTypesOfType } from 'transformers/flatteners/flattenTypesOfType'
import { flattenValidatorsOfValidatingTypeWithMutability } from 'transformers/flatteners/flattenValidatorsOfValidatingType'
import { flattenValuesOfType } from 'transformers/flatteners/flattenValuesOfType'
import { valuePathToTypePath } from 'transformers/flatteners/valuePathToTypePath'
import {
  booleanType,
  list,
  literal,
  nullable,
  numberType,
  object,
  readonlyField,
  stringType,
  union,
} from 'types/builders'
import { type FlattenedTypesOfType } from 'types/FlattenedTypesOfType'
import { type FlattenedValuesOfType } from 'types/FlattenedValuesOfType'
import { type ReadonlyTypeOfType } from 'types/ReadonlyTypeOfType'
import { type ValueOfType } from 'types/ValueOfType'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'
import { type ValueTypesOfDiscriminatedUnion } from 'types/ValueTypesOfDiscriminatedUnion'
import { type ContextOfType, type ErrorsOfType } from 'validation/rules'
import {
  annotations,
  type FunctionalValidator,
  validate,
  type Validator,
} from 'validation/validator'
import { DefinedValidator } from 'validation/validators/DefinedValidator'
import { MinimumStringLengthValidator } from 'validation/validators/MinimumStringLengthValidator'
import { z } from 'zod'

type DogBreed = 'Alsatian' | 'Pug' | 'other'
const definedValidator = new DefinedValidator('is required' as const)
const catNameMustBeCapitalized: FunctionalValidator<
  string,
  { type: 'capitalized' },
  string,
  { readonly isCat: boolean }
> = (value, _path, { isCat }) => {
  const first = value.charAt(0)
  return isCat && first !== first.toUpperCase() ? { type: 'capitalized' } : null
}

const dogBreedType = literal<DogBreed>()
  .required()
  .enforce(definedValidator.validate.bind(definedValidator)).narrow
const speciesType = union('type')
  .or(
    'dog',
    object()
      .field('barks', numberType.required())
      .optionalField('breed', dogBreedType)
      .readonly(),
  )
  .or('cat', object().field('meows', numberType.required()).readonly()).narrow
const petOwnerType = object()
  .field('firstName', stringType.enforce(new MinimumStringLengthValidator(2)))
  .field('email', stringType).narrow
const petType = object()
  .field(
    'name',
    stringType
      .enforce(new MinimumStringLengthValidator(3))
      .enforce(catNameMustBeCapitalized),
  )
  .field('alive', booleanType)
  .field('tags', list(stringType))
  .field('owner', nullable(petOwnerType))
  .readonlyField('species', speciesType).narrow

type Pet = ValueOfType<typeof petType>
type ReadonlyPet = ValueOfType<ReadonlyTypeOfType<typeof petType>>
type Flat = FlattenedTypesOfType<typeof petType, '*'>
type FlatValues = FlattenedValuesOfType<typeof petType, '*'>
type V2T = ValueToTypePathsOfType<typeof petType>
type T2V = Reverse<V2T>

describe('builders over zod', () => {
  it('values', () => {
    expectTypeOf<Pet['name']>().toEqualTypeOf<string>()
    expectTypeOf<Pet['tags']>().toEqualTypeOf<string[]>()
    expectTypeOf<Pet['owner']>().toEqualTypeOf<{
      firstName: string
      email: string
    } | null>()
    type Species =
      | { barks: number; breed?: DogBreed | undefined; readonly type: 'dog' }
      | { meows: number; readonly type: 'cat' }
    expectTypeOf<Pet['species']>().toMatchTypeOf<Species>()
    expectTypeOf<Species>().toMatchTypeOf<Pet['species']>()
    // species is a readonly field
    const pet: Pet = {
      name: 'Rex',
      alive: true,
      tags: [],
      owner: null,
      species: { type: 'dog', barks: 1 },
    }
    expectTypeOf<IsFieldReadonly<Pet, 'species'>>().toEqualTypeOf<true>()
    expectTypeOf<IsFieldReadonly<Pet, 'name'>>().toEqualTypeOf<false>()
    pet.tags.push('x')
    expectTypeOf<ReadonlyPet['tags']>().toEqualTypeOf<readonly string[]>()
    expectTypeOf<IsFieldReadonly<ReadonlyPet, 'name'>>().toEqualTypeOf<true>()
    // zod's own inference still works on the same schema
    expectTypeOf<z.output<typeof petType>['name']>().toEqualTypeOf<string>()
  })

  it('paths', () => {
    expectTypeOf<keyof Flat>().toEqualTypeOf<
      | '$'
      | '$.name'
      | '$.alive'
      | '$.tags'
      | '$.tags.*'
      | '$.owner'
      | '$.owner.firstName'
      | '$.owner.email'
      | '$.species'
      | '$.species:dog.barks'
      | '$.species:dog.breed'
      | '$.species:dog.type'
      | '$.species:cat.meows'
      | '$.species:cat.type'
    >()
    expectTypeOf<FlatValues['$.species:dog.breed']>().toEqualTypeOf<
      DogBreed | undefined
    >()
    expectTypeOf<FlatValues['$.owner']>().toEqualTypeOf<{
      firstName: string
      email: string
    } | null>()
    expectTypeOf<V2T['$.tags.3']>().toEqualTypeOf<'$.tags.*'>()
    expectTypeOf<
      T2V['$.species:cat.meows']
    >().toEqualTypeOf<'$.species:cat.meows'>()
    expectTypeOf<
      ValueTypesOfDiscriminatedUnion<typeof speciesType>['cat']
    >().toEqualTypeOf<{ readonly meows: number; readonly type: 'cat' }>()
  })

  it('rules', () => {
    expectTypeOf<ErrorsOfType<Flat['$.name']>>().toEqualTypeOf<
      | {
          type: 'minimum_string_length'
          receivedLength: number
          minimumLength: number
        }
      | { type: 'capitalized' }
    >()
    expectTypeOf<ContextOfType<Flat['$.name']>>().toEqualTypeOf<{
      readonly isCat: boolean
    }>()
    expectTypeOf<
      ErrorsOfType<Flat['$.species:dog.breed']>
    >().toEqualTypeOf<'is required'>()
    expectTypeOf<ErrorsOfType<Flat['$.alive']>>().toEqualTypeOf<never>()
    const validators = flattenValidatorsOfValidatingTypeWithMutability<
      typeof petType,
      T2V
    >(petType)
    expectTypeOf<keyof typeof validators>().toEqualTypeOf<
      '$.name' | '$.owner.firstName' | '$.species:dog.breed'
    >()
    expect(
      validate(validators['$.name'], 'rex', '$.name', {
        isCat: true,
        forceMutable: false,
      }),
    ).toEqual({ type: 'capitalized' })
    expect(
      validate(validators['$.name'], 'Rex', '$.name', { isCat: true }),
    ).toBeNull()
    expect(
      validate(validators['$.name'], 'Re', '$.name', { isCat: true }),
    ).toEqual({
      type: 'minimum_string_length',
      receivedLength: 2,
      minimumLength: 3,
    })
    expect(
      annotations(validators['$.name'], '$.name', { isCat: true }),
    ).toEqual({ required: true, readonly: false })
    expect(
      annotations(validators['$.species:dog.breed'], '$.species:dog.breed', {}),
    ).toEqual({ required: true, readonly: false })
    const all: Record<string, Validator> =
      flattenValidatorsOfValidatingTypeWithMutability(petType)
    expect(annotations(all['$.species:dog.barks'], '', {})).toEqual({
      required: true,
      readonly: false,
    })
    expect(annotations(all['$.species:dog.type'], '', {})).toEqual({
      required: true,
      readonly: true,
    })
    expect(annotations(all['$.species'], '', { forceMutable: true })).toEqual({
      required: false,
      readonly: false,
    })
    expect(annotations(all['$.species'], '', { forceMutable: false })).toEqual({
      required: false,
      readonly: true,
    })
  })

  it('nests discriminated unions', () => {
    const inner = union('y')
      .or('p', object().field('a', booleanType))
      .or('q', object().field('b', numberType)).narrow
    const outer = union('x')
      .or('1', inner)
      .or('2', object().field('c', stringType)).narrow
    type Outer = ValueOfType<typeof outer>
    const p: Outer = { x: '1', y: 'p', a: true }
    const c: Outer = { x: '2', c: '' }
    expectTypeOf<keyof FlattenedTypesOfType<typeof outer, '*'>>().toEqualTypeOf<
      | '$'
      | '$:1:p.a'
      | '$:1:p.x'
      | '$:1:p.y'
      | '$:1:q.b'
      | '$:1:q.x'
      | '$:1:q.y'
      | '$:2.c'
      | '$:2.x'
    >()
    expect(Object.keys(flattenTypesOfType(outer)).sort()).toEqual([
      '$',
      '$:1:p.a',
      '$:1:p.x',
      '$:1:p.y',
      '$:1:q.b',
      '$:1:q.x',
      '$:1:q.y',
      '$:2.c',
      '$:2.x',
    ])
    expect(flattenValuesOfType(outer, p)).toEqual({
      $: p,
      '$:1:p.a': true,
      '$:1:p.x': '1',
      '$:1:p.y': 'p',
    })
    expect(copy(outer, c)).toEqual(c)
    expect(
      equals(outer, copy(outer, p), copy(outer, { x: '1', y: 'q', b: 1 })),
    ).toBe(false)
    expect(valuePathToTypePath(outer, '$:1:q.b')).toEqual('$:1:q.b')
    expect(outer.safeParse(p).success).toBe(true)
  })

  it('runtime', () => {
    const pet: ReadonlyPet = {
      name: 'Rex',
      alive: true,
      tags: ['a'],
      owner: { firstName: 'Bob', email: '' },
      species: { type: 'dog', barks: 1 },
    }
    const copied = copy(petType, pet)
    expect(copied).toEqual(pet)
    expect(copied).not.toBe(pet)
    expect(copied.tags).not.toBe(pet.tags)
    expect(equals(petType, copied, copy(petType, pet))).toBe(true)
    expect(
      equals(
        petType,
        copied,
        copy(petType, { ...pet, species: { type: 'cat', meows: 2 } }),
      ),
    ).toBe(false)
    expect(
      equals(petType, copied, copy(petType, { ...pet, owner: null })),
    ).toBe(false)
    const observed = mobxCopy(petType, pet)
    expect(observed.species).toEqual(pet.species)
    expect(Object.keys(flattenTypesOfType(petType)).sort()).toEqual([
      '$',
      '$.alive',
      '$.name',
      '$.owner',
      '$.owner.email',
      '$.owner.firstName',
      '$.species',
      '$.species:cat.meows',
      '$.species:cat.type',
      '$.species:dog.barks',
      '$.species:dog.breed',
      '$.species:dog.type',
      '$.tags',
      '$.tags.*',
    ])
    expect(flattenValuesOfType(petType, pet)).toEqual({
      $: pet,
      '$.name': 'Rex',
      '$.alive': true,
      '$.tags': ['a'],
      '$.tags.0': 'a',
      '$.owner': pet.owner,
      '$.owner.firstName': 'Bob',
      '$.owner.email': '',
      '$.species': pet.species,
      '$.species:dog.barks': 1,
      '$.species:dog.breed': undefined,
      '$.species:dog.type': 'dog',
    })
    expect(
      flattenValuesOfType(petType, { ...pet, owner: null })['$.owner'],
    ).toBeNull()
    expect(valuePathToTypePath(petType, '$.tags.3')).toEqual('$.tags.*')
    expect(valuePathToTypePath(petType, '$.species:cat.meows')).toEqual(
      '$.species:cat.meows',
    )
    expect(valuePathToTypePath(petType, '$.owner.email')).toEqual(
      '$.owner.email',
    )
    // plain zod still parses (rules are not part of parse)
    expect(petType.safeParse(pet).success).toBe(true)
    expect(petType.safeParse({ ...pet, alive: 'no' }).success).toBe(false)
    // readonlyField works on raw zod objects
    const raw = z.object({ a: readonlyField(z.string()), b: z.number() })
    expectTypeOf<ValueOfType<typeof raw>>().toEqualTypeOf<{
      readonly a: string
      b: number
    }>()
  })
})
