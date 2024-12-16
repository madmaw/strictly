import {
  FormModel,
  FormPresenter,
  IntegerToStringConverter,
} from '@de/form-react'
import {
  adapterFromPrototype,
  adapterFromTwoWayConverter,
  identityAdapter,
  listAdapter,
} from '@de/form-react/core/mobx/field_adapter_builder'
import { type FlattenedAdaptersOfFields } from '@de/form-react/core/mobx/flattened_adapters_of_fields'
import { SelectDiscriminatedUnionConverter } from '@de/form-react/field_converters/select_value_type_converter'
import { TrimmingStringConverter } from '@de/form-react/field_converters/trimming_string_converter'
import { minimumStringLengthFieldValidatorFactory } from '@de/form-react/field_validators/minimum_string_length_field_validator'
import { prototypingFieldValueFactory } from '@de/form-react/field_value_factories/prototyping_field_value_factory'
import { type PetFormFields } from 'features/form/pet/pet_form'
import { type PetSpeciesCatFormFields } from 'features/form/pet/pet_species_cat_form'
import { type PetSpeciesDogFormFields } from 'features/form/pet/pet_species_dog_form'
import { type PetSpeciesFormFields } from 'features/form/pet/pet_species_form'
import {
  type FlattenedPetTypeDefs,
  NAME_TOO_SHORT_ERROR,
  NOT_A_NUMBER_ERROR,
  type Pet,
  petTypeDef,
  type PetValueToTypePaths,
  speciesTypeDef,
  type TagValuePath,
} from 'features/form/pet/types'
import { type SimplifyDeep } from 'type-fest'

type AllFields = PetFormFields & PetSpeciesFormFields & PetSpeciesCatFormFields & PetSpeciesDogFormFields

const adapters: SimplifyDeep<FlattenedAdaptersOfFields<
  PetValueToTypePaths,
  FlattenedPetTypeDefs,
  AllFields
>> = {
  '$.name': adapterFromTwoWayConverter(
    new TrimmingStringConverter(),
    prototypingFieldValueFactory(''),
  ).validateTo(
    minimumStringLengthFieldValidatorFactory(
      2,
      NAME_TOO_SHORT_ERROR,
    ),
  ),
  '$.alive': identityAdapter(false),
  '$.species': adapterFromTwoWayConverter(
    new SelectDiscriminatedUnionConverter(
      speciesTypeDef,
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
  '$.tags': listAdapter(),
  '$.tags.*': identityAdapter(''),
  '$.newTag': identityAdapter(''),
}

export class AssistedPetFormPresenter extends FormPresenter<
  typeof petTypeDef,
  PetValueToTypePaths,
  typeof adapters
> {
  constructor() {
    super(
      petTypeDef,
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
  typeof petTypeDef,
  PetValueToTypePaths,
  typeof adapters
> {
}
