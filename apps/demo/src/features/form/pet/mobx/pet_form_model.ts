import {
  FormModel,
} from '@strictly/react-form'
import { petFieldAdapters } from 'features/form/pet/fields'
import {
  type Pet,
  petType,
  type PetValueToTypePaths,
  type TagValuePath,
} from 'features/form/pet/types'

export class PetFormModel extends FormModel<
  typeof petType,
  PetValueToTypePaths,
  typeof petFieldAdapters
> {
  constructor(value: Pet) {
    super(
      petType,
      value,
      petFieldAdapters,
    )
  }

  removeTag(valuePath: TagValuePath) {
    this.removeListItem(valuePath)
  }
}
