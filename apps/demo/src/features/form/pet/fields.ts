import {
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingType,
  type FunctionalValidator,
  mergeValidators,
  MinimumStringLengthValidator,
  type ReadonlyTypeOfType,
} from '@strictly/define'
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
} from '@strictly/react-form'
import { IsAliveTwoWayConverter } from './is_alive_field_converter'
import {
  petOwnerType,
  unvalidatedPetOwnerFieldAdapters,
} from './pet_owner_fields_view'
import {
  catBreedType,
  type DogBreed,
  dogBreedType,
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
  petType,
  type PetTypeToValuePaths,
  type PetValueToTypePaths,
  speciesType,
} from './types'

export const TagAlreadyExistsErrorType = 'tag_already_exists'
export type TagAlreadyExistsError = {
  type: typeof TagAlreadyExistsErrorType,
  value: string,
}

const petTypeValidators = flattenValidatorsOfValidatingType<typeof petType, PetTypeToValuePaths>(
  petType,
)

// want to assign it to a type
// eslint-disable-next-line func-style
const tagAlreadyExistsValidator: FunctionalValidator<string, TagAlreadyExistsError, '$.newTag',
  { readonly tags: readonly string[] }> = (
    value,
    _path,
    { tags },
  ) => {
    if (tags.indexOf(value) >= 0) {
      return {
        type: TagAlreadyExistsErrorType,
        value,
      }
    }
    return null
  }

export const petValidators = {
  ...petTypeValidators,
  '$.newTag': mergeValidators(
    new MinimumStringLengthValidator(2),
    tagAlreadyExistsValidator,
  ),
} as const

// TODO move fields into respective views
const rawPetFieldAdapters = {
  '$.alive': identityAdapter(false).narrow,
  '$.name': trimmingStringAdapter().narrow,
  '$.newTag': trimmingStringAdapter().narrow,
  ...subFormFieldAdapters(
    unvalidatedPetOwnerFieldAdapters,
    '$.owner',
  ),
  '$.owner': adapterFromTwoWayConverter(
    new NullableToBooleanConverter(
      petOwnerType,
      {
        firstName: '',
        surname: '',
        phoneNumber: '',
        email: '',
      },
      undefined,
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
      [
        'Burmese',
        'Siamese',
        'DSH',
      ] as const,
      undefined,
      NOT_A_BREED_ERROR,
    ),
  ).narrow,
  '$.species:cat.meows': identityAdapter(0).narrow,
  '$.species:dog.barks': adapterFromPrototype(
    new IntegerToStringConverter(NOT_A_NUMBER_ERROR),
    0,
  ).withIdentity(
    v => typeof v === 'number',
  ).narrow,
  '$.species:dog.breed': adapterFromTwoWayConverter(
    new SelectLiteralConverter(
      dogBreedType,
      {
        Alsatian: 'Alsatian',
        Pug: 'Pug',
        other: 'Other',
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      undefined as undefined | DogBreed,
      NOT_A_BREED_ERROR,
      false,
    ),
  ).narrow,
  '$.tags': listAdapter<string, '$.tags', {}>().narrow,
  '$.tags.*': trimmingStringAdapter().narrow,
} as const satisfies Partial<
  FieldAdaptersOfValues<
    FlattenedValuesOfType<ReadonlyTypeOfType<typeof petType>, '*'>,
    PetTypeToValuePaths,
    {}
  > & {
    // TODO check list of existing tags in context
    '$.newTag': FieldAdapter<string, string, TagAlreadyExistsError, '$.newTag', unknown>,
  }
>

const validatedPetAdapters = mergeAdaptersWithValidators(
  rawPetFieldAdapters,
  petValidators,
)
export type PetTypePaths = keyof typeof rawPetFieldAdapters
export type PetValuePaths = PetTypeToValuePaths[PetTypePaths]

export const petFieldAdapters = mergeFieldAdaptersWithTwoWayConverter(
  validatedPetAdapters,
  new IsAliveTwoWayConverter(),
)

export type PetFields = FormFieldsOfFieldAdapters<PetValueToTypePaths, typeof petFieldAdapters>
