import {
  FormModel,
  FormPresenter,
  StringToIntegerConverter,
} from '@de/form-react'
import {
  adapterFromConverter,
  adapterFromPrototype,
  identityAdapter,
  listAdapter,
} from '@de/form-react/core/mobx/field_adapter_builder'
import { type FlattenedAdaptersOfFields } from '@de/form-react/core/mobx/flattened_adapters_of_fields'
import { SelectDiscriminatedUnionConverter } from '@de/form-react/field_converters/select_value_type_converter'
import { TrimmingStringConverter } from '@de/form-react/field_converters/trimming_string_converter'
import { minimumStringLengthFieldValidatorFactory } from '@de/form-react/field_validators/minimum_string_length_field_validator'
import { type PetFormFields } from 'features/form/pet/pet_form'
import { type PetSpeciesCatFormFields } from 'features/form/pet/pet_species_cat_form'
import { type PetSpeciesDogFormFields } from 'features/form/pet/pet_species_dog_form'
import { type PetSpeciesFormFields } from 'features/form/pet/pet_species_form'
import {
  type FlattenedPetJsonValueToTypePaths,
  type FlattenedPetTypeDefs,
  NAME_TOO_SHORT_ERROR,
  NOT_A_NUMBER_ERROR,
  petTypeDef,
  speciesTypeDef,
  type TagValuePath,
} from 'features/form/pet/types'
import { type SimplifyDeep } from 'type-fest'

const converters: SimplifyDeep<FlattenedAdaptersOfFields<
  FlattenedPetJsonValueToTypePaths,
  FlattenedPetTypeDefs,
  PetFormFields & PetSpeciesFormFields & PetSpeciesCatFormFields & PetSpeciesDogFormFields
>> = {
  '$.name': adapterFromPrototype(
    new TrimmingStringConverter(),
    '',
  ).validateTo(
    minimumStringLengthFieldValidatorFactory(
      2,
      NAME_TOO_SHORT_ERROR,
    ),
  ),
  '$.alive': identityAdapter(false),
  '$.species': adapterFromConverter(
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
  '$.species.cat:meows': adapterFromPrototype(new StringToIntegerConverter(NOT_A_NUMBER_ERROR), 0),
  '$.species.dog:barks': adapterFromPrototype(new StringToIntegerConverter(NOT_A_NUMBER_ERROR), 0),
  '$.tags': listAdapter(),
  '$.tags.*': identityAdapter(''),
  '$.newTag': identityAdapter(''),
}

export class AssistedPetFormPresenter extends FormPresenter<
  typeof petTypeDef,
  FlattenedPetJsonValueToTypePaths,
  typeof converters
> {
  constructor() {
    super(
      petTypeDef,
      converters,
    )
  }

  removeTag(_model: AssistedPetFormModel, valuePath: TagValuePath) {
    // eslint-disable-next-line no-console
    console.log('delete', valuePath)
  }
}

// should be identical to `PetFormFields`
// export type AssistedPetFormFields = FormFieldsOfPresenter<AssistedPetFormPresenter>

export class AssistedPetFormModel extends FormModel<
  typeof petTypeDef,
  FlattenedPetJsonValueToTypePaths,
  typeof converters
> {
}
