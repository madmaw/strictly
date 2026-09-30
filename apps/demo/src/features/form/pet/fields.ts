import {
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingTypeWithMutability,
  type FunctionalValidator,
  mergeValidators,
  MinimumStringLengthValidator,
  type ReadonlyTypeOfType,
  type ValuePathsOfTypePath,
} from '@strictly/base'
import {
  adapterFromPrototype,
  adapterFromTwoWayConverter,
  type FieldAdapter,
  type FieldAdaptersOfValues,
  type FormFieldsOfFieldAdapters,
  identityAdapter,
  IntegerToStringConverter,
  listAdapter,
  mergeAdaptersWithValidators,
  mergeFieldAdaptersWithTwoWayConverter,
  NullableToBooleanConverter,
  SelectDiscriminatedUnionConverter,
  SelectLiteralConverter,
  SelectStringConverter,
  subFormFieldAdapters,
  trimmingStringAdapter,
} from '@strictly/react'
import { IsAliveTwoWayConverter } from './IsAliveFieldConverter'
import {
  petOwnerType,
  unvalidatedPetOwnerFieldAdapters,
} from './PetOwnerFieldsView'
import {
  catBreedType,
  dogBreedType,
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
  petType,
  type PetValueToTypePaths,
  speciesType,
} from './types'

export const TagAlreadyExistsErrorType = 'tag_already_exists'
export type TagAlreadyExistsError = {
  type: typeof TagAlreadyExistsErrorType
  value: string
}

const petTypeValidators =
  flattenValidatorsOfValidatingTypeWithMutability(petType)

// want to assign it to a type
const tagAlreadyExistsValidator: FunctionalValidator<
  string,
  TagAlreadyExistsError,
  '$.newTag',
  { readonly tags: readonly string[] }
> = (value, _path, { tags }) => {
  if (tags.includes(value)) {
    return {
      type: TagAlreadyExistsErrorType,
      value,
    }
  }
  return null
}

export const TagNotEmptyErrorType = 'tag_not_empty'
export type TagNotEmptyError = {
  type: typeof TagNotEmptyErrorType
  value: string
}

// want to assign it to a type
const tagNotEmptyErrorValidator: FunctionalValidator<
  string,
  TagNotEmptyError,
  '$.newTag'
> = () =>
  // placeholder error so we can inject an error of this type manually
  null

export const petValidators = {
  ...petTypeValidators,
  '$.newTag': mergeValidators(
    mergeValidators(
      new MinimumStringLengthValidator(2),
      tagAlreadyExistsValidator,
    ),
    tagNotEmptyErrorValidator,
  ),
} as const

// TODO move fields into respective views
const rawPetFieldAdapters = {
  '$.alive': identityAdapter(false).narrow,
  '$.name': trimmingStringAdapter().narrow,
  '$.newTag': trimmingStringAdapter().narrow,
  ...subFormFieldAdapters(unvalidatedPetOwnerFieldAdapters, '$.owner'),
  '$.owner': adapterFromTwoWayConverter(
    new NullableToBooleanConverter(
      petOwnerType,
      {
        firstName: '',
        surname: '',
        phoneNumber: '',
        email: '',
      },
      null,
    ),
  ).narrow,
  '$.species': adapterFromTwoWayConverter(
    new SelectDiscriminatedUnionConverter(
      speciesType,
      {
        cat: {
          type: 'cat',
          meows: 0,
        },
        dog: {
          type: 'dog',
          barks: 0,
        },
      },
      'cat',
      true,
    ),
  ).narrow,
  '$.species:cat.breed': adapterFromTwoWayConverter(
    new SelectStringConverter(
      catBreedType,
      ['Burmese', 'Siamese', 'DSH'] as const,
      null,
      NOT_A_BREED_ERROR,
    ),
  ).narrow,
  '$.species:cat.meows': identityAdapter(0).narrow,
  '$.species:dog.barks': adapterFromPrototype(
    new IntegerToStringConverter(NOT_A_NUMBER_ERROR),
    0,
  ).withIdentity((v) => typeof v === 'number').narrow,
  '$.species:dog.breed': adapterFromTwoWayConverter(
    new SelectLiteralConverter(
      dogBreedType,
      {
        Alsatian: 'Alsatian',
        Pug: 'Pug',
        other: 'Other',
      },
      null,
      NOT_A_BREED_ERROR,
      false,
    ),
  ).narrow,
  '$.tags': listAdapter<string, '$.tags', {}>().narrow,
  '$.tags.*': trimmingStringAdapter().narrow,
} as const satisfies Partial<
  FieldAdaptersOfValues<
    FlattenedValuesOfType<ReadonlyTypeOfType<typeof petType>, '*'>,
    PetValueToTypePaths,
    {}
  > & {
    // TODO check list of existing tags in context
    '$.newTag': FieldAdapter<
      string,
      string,
      TagAlreadyExistsError,
      '$.newTag',
      unknown
    >
  }
>

const validatedPetAdapters = mergeAdaptersWithValidators(
  rawPetFieldAdapters,
  petValidators,
)
export type PetTypePaths = keyof typeof rawPetFieldAdapters
export type PetValuePaths = ValuePathsOfTypePath<
  PetValueToTypePaths,
  PetTypePaths
>

export const petFieldAdapters = mergeFieldAdaptersWithTwoWayConverter(
  validatedPetAdapters,
  new IsAliveTwoWayConverter(),
)

export type PetFields = FormFieldsOfFieldAdapters<
  PetValueToTypePaths,
  typeof petFieldAdapters
>
