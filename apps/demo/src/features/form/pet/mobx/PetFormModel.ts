import {
  type ContextOf,
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

// TODO tags isn't being picked up correctly from
// petFieldAdapters because of the spread operation (which is wrong because the newTag field
// should be in a separate form)
type PetFormModelContext = {
  readonly tags: readonly string[],
} & ContextOf<typeof petFieldAdapters>

class PetFormModelContextSource implements FormModelContextSource<PetFormModelContext, Pet, TagValuePath> {
  constructor(private readonly forceMutable: boolean) {
  }

  forPath(value: Pet) {
    return {
      tags: value.tags,
      alive: value.alive,
      isCat: value.species.type === 'cat',
      forceMutable: this.forceMutable,
    }
  }
}

export class PetFormModel extends FormModel<
  typeof petType,
  PetValueToTypePaths,
  typeof petFieldAdapters,
  PetFormModelContext,
  PetFormModelContextSource
> {
  constructor(value: Pet, forceMutable: boolean) {
    super(
      petType,
      value,
      petFieldAdapters,
      new PetFormModelContextSource(forceMutable),
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
