import {
  FormModel,
  FormPresenter,
} from '@strictly/react-form'
import { petFieldAdapters } from 'features/form/pet/fields'
import {
  type Pet,
  petType,
  type PetValueToTypePaths,
  type TagValuePath,
} from 'features/form/pet/types'

export class PetFormPresenter extends FormPresenter<
  typeof petType,
  PetValueToTypePaths,
  typeof petFieldAdapters
> {
  constructor() {
    super(
      petType,
      petFieldAdapters,
    )
  }

  override createModel(value: Pet) {
    return new PetFormModel(this.type, value, this.adapters)
  }

  removeTag(model: PetFormModel, valuePath: TagValuePath) {
    this.removeListItem(model, valuePath)
  }
}

export class PetFormModel extends FormModel<
  typeof petType,
  PetValueToTypePaths,
  typeof petFieldAdapters
> {
}
