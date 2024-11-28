import {
  FormModel,
  FormPresenter,
  PassThroughConverter,
  StringToIntegerConverter,
} from '@de/form-react'
import { SelectDiscriminatedUnionConverter } from '@de/form-react/converters/select_value_type_converter'
import { TrimmingStringConverter } from '@de/form-react/converters/trimming_string_converter'
import { type FlattenedConvertersOfFormFields } from '@de/form-react/types/flattened_converters_of_form_fields'
import { minimumStringLengthValidatorFactory } from '@de/form-react/validators/minimum_string_length_validator'
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
} from 'features/form/pet/types'
import { type SimplifyDeep } from 'type-fest'

const converters: SimplifyDeep<FlattenedConvertersOfFormFields<
  FlattenedPetJsonValueToTypePaths,
  FlattenedPetTypeDefs,
  PetFormFields & PetSpeciesFormFields & PetSpeciesCatFormFields & PetSpeciesDogFormFields
>> = {
  '$.name': new TrimmingStringConverter(
    '',
    [
      minimumStringLengthValidatorFactory(
        2,
        NAME_TOO_SHORT_ERROR,
      ),
    ],
  ),
  '$.alive': new PassThroughConverter(false),
  '$.species': new SelectDiscriminatedUnionConverter(
    'cat',
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
  ),
  '$.species.cat:meows': new StringToIntegerConverter(NOT_A_NUMBER_ERROR),
  '$.species.dog:barks': new StringToIntegerConverter(NOT_A_NUMBER_ERROR),
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
}

// should be identical to `PetFormFields`
// export type AssistedPetFormFields = FormFieldsOfPresenter<AssistedPetFormPresenter>

export class AssistedPetFormModel extends FormModel<
  typeof petTypeDef,
  FlattenedPetJsonValueToTypePaths,
  typeof converters
> {
}
