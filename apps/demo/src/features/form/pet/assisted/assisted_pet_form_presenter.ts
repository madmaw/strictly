import {
  FormModel,
  FormPresenter,
  PassThroughConverter,
} from '@de/form-react'
import {
  type FlattenedPetJsonValueToTypePaths,
  petTypeDef,
} from 'features/form/pet/types'

const converters = {
  '$.name': new PassThroughConverter<string, {}, string>(),
  '$.alive': new PassThroughConverter<string, {}, boolean>(),
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

export class AssistedPetFormModel extends FormModel<
  typeof petTypeDef,
  FlattenedPetJsonValueToTypePaths,
  typeof converters
> {
}
