import {
  FormModel,
  FormPresenter,
  PassThroughConverter,
} from '@de/form-react'
import { TrimmingStringConverter } from '@de/form-react/converters/trimming_string_converter'
import { minimumStringLengthValidatorFactory } from '@de/form-react/validators/minimum_string_length_validator'
import {
  type FlattenedPetJsonValueToTypePaths,
  NAME_TOO_SHORT_ERROR,
  type PetFormFields,
  petTypeDef,
} from 'features/form/pet/types'

const converters = {
  '$.name': new TrimmingStringConverter<string, PetFormFields>([
    minimumStringLengthValidatorFactory(
      2,
      NAME_TOO_SHORT_ERROR,
    ),
  ]),
  '$.alive': new PassThroughConverter<string, PetFormFields, boolean>(),
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
