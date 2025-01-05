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
  prototypingFieldValueFactory,
  SelectDiscriminatedUnionConverter,
  SelectLiteralConverter,
  SelectStringConverter,
  TrimmingStringConverter,
} from '@strictly/react-form'
import {
  catBreedType,
  dogBreedType,
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
  type Pet,
  type petType,
  type PetTypeToValuePaths,
  petValidators,
  type PetValueToTypePaths,
  speciesType,
} from './types'

const petFieldConverters = {
  '$.alive': identityAdapter(false).narrow(),
  '$.name': adapterFromTwoWayConverter(
    new TrimmingStringConverter(),
    prototypingFieldValueFactory(''),
  ).narrow(),
  '$.newTag': identityAdapter('').narrow(),
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
    ),
  ).narrow(),
  '$.species.cat:breed': adapterFromTwoWayConverter(
    new SelectStringConverter(
      catBreedType,
      [
        'Burmese',
        'Siamese',
        'DSH',
      ] as const,
      null,
      NOT_A_BREED_ERROR,
    ),
  ).narrow(),
  '$.species.cat:meows': identityAdapter(0).narrow(),
  '$.species.dog:barks': adapterFromPrototype(
    new IntegerToStringConverter(NOT_A_NUMBER_ERROR),
    0,
  ).withIdentity(
    v => typeof v === 'number',
  ).narrow(),
  '$.species.dog:breed': adapterFromTwoWayConverter(
    new SelectLiteralConverter(
      dogBreedType,
      {
        Alsatian: 'Alsatian',
        Pug: 'Pug',
        other: 'Other',
      },
      null,
      NOT_A_BREED_ERROR,
    ),
  ).narrow(),
  '$.tags': listAdapter<string, string, '$.tags', Pet>().narrow(),
  '$.tags.*': identityAdapter('').narrow(),
} as const satisfies Partial<
  FieldAdaptersOfValues<
    FlattenedValuesOfType<ReadonlyTypeOfType<typeof petType>, '*'>,
    PetTypeToValuePaths,
    Pet
  > & {
    '$.newTag': FieldAdapter<string, string, never, '$.newTag', Pet>,
  }
>

export const petFieldAdapters = mergeAdaptersWithValidators(
  petFieldConverters,
  petValidators,
)

export type PetFields = FormFieldsOfFieldAdapters<PetValueToTypePaths, typeof petFieldAdapters>
