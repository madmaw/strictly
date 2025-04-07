import {
  type FlattenedValuesOfType,
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
  prototypingFieldValueFactory,
  SelectDiscriminatedUnionConverter,
  SelectLiteralConverter,
  SelectStringConverter,
  subFormFieldAdapters,
  TrimmingStringConverter,
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
  type Pet,
  petType,
  type PetTypeToValuePaths,
  petValidators,
  type PetValueToTypePaths,
  speciesType,
} from './types'

// TODO move fields into respective views
const rawPetFieldAdapters = {
  '$.alive': identityAdapter(false).narrow,
  '$.name': adapterFromTwoWayConverter(
    new TrimmingStringConverter(),
    prototypingFieldValueFactory(''),
  ).narrow,
  '$.newTag': identityAdapter('').narrow,
  ...subFormFieldAdapters<
    typeof unvalidatedPetOwnerFieldAdapters,
    '$.owner',
    PetTypeToValuePaths,
    ReadonlyTypeOfType<typeof petType>
  >(
    unvalidatedPetOwnerFieldAdapters,
    '$.owner',
    // TODO this cast is annoying. Is there some way to generate a readonlyPetType instead?
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    petType as ReadonlyTypeOfType<typeof petType>,
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
  '$.species.cat:breed': adapterFromTwoWayConverter(
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
  '$.species.cat:meows': identityAdapter(0).narrow,
  '$.species.dog:barks': adapterFromPrototype(
    new IntegerToStringConverter(NOT_A_NUMBER_ERROR),
    0,
  ).withIdentity(
    v => typeof v === 'number',
  ).narrow,
  '$.species.dog:breed': adapterFromTwoWayConverter(
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
  '$.tags': listAdapter<string, '$.tags', Pet>().narrow,
  '$.tags.*': identityAdapter('').narrow,
} as const satisfies Partial<
  FieldAdaptersOfValues<
    FlattenedValuesOfType<ReadonlyTypeOfType<typeof petType>, '*'>,
    PetTypeToValuePaths,
    Pet
  > & {
    '$.newTag': FieldAdapter<string, string, never, '$.newTag', Pet>,
  }
>

export const petFieldAdapters = mergeFieldAdaptersWithTwoWayConverter(
  mergeAdaptersWithValidators(
    rawPetFieldAdapters,
    petValidators,
  ),
  new IsAliveTwoWayConverter(),
)

export type PetFields = FormFieldsOfFieldAdapters<PetValueToTypePaths, typeof petFieldAdapters>
