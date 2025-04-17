import {
  type FormMode,
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
  constructor(value: Pet, mode: FormMode) {
    super(
      petType,
      value,
      petFieldAdapters,
      mode,
    )
  }

  protected override toContext(value: Pet) {
    return {
      tags: value.tags,
      alive: value.alive,
      isCat: value.species.type === 'cat',
    }
  }

  removeTag(valuePath: TagValuePath) {
    this.removeListItem(valuePath)
  }
}
