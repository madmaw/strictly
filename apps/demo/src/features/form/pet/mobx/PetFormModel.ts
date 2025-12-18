import {
  type FormMode,
  FormModel,
  type FormModelContextSource,
} from '@strictly/react-form'
import {
  petFieldAdapters,
  TagNotEmptyErrorType,
} from 'features/form/pet/fields'
import {
  type Pet,
  petType,
  type PetValueToTypePaths,
  type TagValuePath,
} from 'features/form/pet/types'
import { computed } from 'mobx'

type PetFormModelContext = {
  readonly tags: readonly string[],
  readonly alive: boolean,
  readonly isCat: boolean,
}
class PetFormModelContextSource implements FormModelContextSource<PetFormModelContext, Pet, TagValuePath> {
  forPath(value: Pet) {
    return {
      tags: value.tags,
      alive: value.alive,
      isCat: value.species.type === 'cat',
    }
  }
}

export class PetFormModel extends FormModel<
  typeof petType,
  PetValueToTypePaths,
  typeof petFieldAdapters,
  PetFormModelContext
> {
  constructor(value: Pet, mode: FormMode) {
    super(
      petType,
      value,
      petFieldAdapters,
      new PetFormModelContextSource(),
      mode,
    )
  }

  @computed
  get submitDisabled() {
    return !this.valueChanged
  }

  removeTag(valuePath: TagValuePath) {
    this.removeListItem(valuePath)
  }

  override validateSubmit() {
    const allResult = super.validateSubmit()
    // check if the new tag is non-empty and block submission if it is
    const newTag = this.fields['$.newTag'].value.trim()
    const newTagPopulated = newTag.length > 0
    if (newTagPopulated) {
      this.overrideFieldError('$.newTag', {
        type: TagNotEmptyErrorType,
        value: newTag,
      })
    }
    return allResult && !newTagPopulated
  }
}
