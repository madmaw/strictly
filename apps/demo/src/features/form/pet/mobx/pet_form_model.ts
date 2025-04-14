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
  typeof petFieldAdapters,
  {
    tags: readonly string[],
    alive: boolean,
  }
> {
  constructor(value: Pet) {
    super(
      petType,
      value,
      petFieldAdapters,
    )
  }

  protected override toContext(value: Pet) {
    // could also just return value directly
    return {
      tags: value.tags,
      alive: value.alive,
    }
  }

  removeTag(valuePath: TagValuePath) {
    this.removeListItem(valuePath)
  }
}
