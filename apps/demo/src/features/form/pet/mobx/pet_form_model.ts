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
