import { minimumStringLengthValidatorFactory } from '@strictly/define'
import {
  adapterFromPrototype,
  adapterFromTwoWayConverter,
  type FlattenedAdaptersOfFields,
  FormModel,
  FormPresenter,
  identityAdapter,
  IntegerToStringConverter,
  listAdapter,
  prototypingFieldValueFactory,
  SelectDiscriminatedUnionConverter,
  SelectLiteralConverter,
  SelectStringConverter,
  TrimmingStringConverter,
} from '@strictly/react-form'
import { type PetFormFields } from 'features/form/pet/pet_form'
import { type PetSpeciesCatFormFields } from 'features/form/pet/pet_species_cat_form'
import { type PetSpeciesDogFormFields } from 'features/form/pet/pet_species_dog_form'
import { type PetSpeciesFormFields } from 'features/form/pet/pet_species_form'
import {
  catBreedType,
  dogBreedType,
  type FlattenedPetTypeDefs,
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
  type Pet,
  petType,
  type PetValueToTypePaths,
  speciesType,
  type TagValuePath,
} from 'features/form/pet/types'
import { type SimplifyDeep } from 'type-fest'

type AllFields = PetFormFields & PetSpeciesFormFields & PetSpeciesCatFormFields & PetSpeciesDogFormFields

const adapters: SimplifyDeep<FlattenedAdaptersOfFields<
  PetValueToTypePaths,
  FlattenedPetTypeDefs,
  AllFields
>> = {
  '$.alive': identityAdapter(false),
  '$.name': adapterFromTwoWayConverter(
    new TrimmingStringConverter(),
    prototypingFieldValueFactory(''),
  ).validateTo(
    minimumStringLengthValidatorFactory(
      3,
    ),
  ),
  '$.newTag': identityAdapter(''),
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
  ),
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
  ),
  '$.species.cat:meows': identityAdapter(0),
  '$.species.dog:barks': adapterFromPrototype<
    number,
    string,
    typeof NOT_A_NUMBER_ERROR,
    '$.species.dog:barks',
    Pet
  >(
    new IntegerToStringConverter(NOT_A_NUMBER_ERROR),
    0,
  ).withIdentity(
    v => typeof v === 'number',
  ),
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
  ),
  '$.tags': listAdapter(),
  '$.tags.*': identityAdapter(''),
}

export class AssistedPetFormPresenter extends FormPresenter<
  typeof petType,
  PetValueToTypePaths,
  typeof adapters
> {
  constructor() {
    super(
      petType,
      adapters,
    )
  }

  removeTag(model: AssistedPetFormModel, valuePath: TagValuePath) {
    this.removeListItem(model, valuePath)
  }
}

// should be identical to `PetFormFields`
// export type AssistedPetFormFields = FormFieldsOfPresenter<AssistedPetFormPresenter>

export class AssistedPetFormModel extends FormModel<
  typeof petType,
  PetValueToTypePaths,
  typeof adapters
> {
}
