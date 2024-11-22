import {
  FormModel,
  FormPresenter,
} from '@de/form-react'
import { PassThroughConverter } from '@de/form-react/react/mobx/converters/pass_through_converter'
import {
  type FlattenedPetJsonValueToTypePaths,
  petTypeDef,
} from 'features/form/pet/types'

const converters = {
  '$.name': new PassThroughConverter<string, string>(),
  '$.alive': new PassThroughConverter<string, boolean>(),
}

export class AssistedPetFormPresenter extends FormPresenter<
  typeof petTypeDef,
  string,
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
  string,
  FlattenedPetJsonValueToTypePaths,
  typeof converters
> {
}
