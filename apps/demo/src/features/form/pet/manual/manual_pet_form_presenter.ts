import { mobxCopy } from '@de/fine/transformers/copies/mobx_copy'
import { type MobxObservable } from '@de/fine/types/mobx_value_type_of'
import {
  type FlattenedPetAccessors,
  type FlattenedPetJsonValueToTypePaths,
  type FlattenedPetValueTypes,
  type MutablePet,
  NAME_TOO_SHORT_ERROR,
  type Pet,
  type PetFormFields,
  petTypeDef,
  type PetValuePaths,
} from 'features/form/pet/types'
import {
  computed,
  observable,
  runInAction,
} from 'mobx'

export class ManualPetFormPresenter {
  constructor() {
  }

  onFieldValueChange<P extends PetValuePaths>(
    model: ManualPetFormModel,
    path: P,
    value: FlattenedPetValueTypes[FlattenedPetJsonValueToTypePaths[P]],
  ) {
    runInAction(function () {
      delete model.errors[path]
      // types should match but a cast is necessary here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      model.accessors[path].set(value as any)
    })
  }

  validate({
    errors,
    value: {
      name,
    },
  }: ManualPetFormModel) {
    runInAction(function () {
      if (name == null || name.trim().length < 2) {
        errors['$.name'] = NAME_TOO_SHORT_ERROR
      }
    })
  }
}

export class ManualPetFormModel {
  @observable.shallow
  accessor errors: Partial<Record<PetValuePaths, string>> = {}

  @computed
  get accessors(): FlattenedPetAccessors {
    return {
      $: {
        value: this.value,
        set: (value: Pet) => {
          this.value = mobxCopy<typeof petTypeDef>(petTypeDef, value)
        },
      },
      '$.alive': {
        value: this.value.alive,
        set: (value: boolean) => {
          this.value.alive = value
        },
      },
      '$.name': {
        value: this.value.name,
        set: (value: string) => {
          this.value.name = value
        },
      },
    }
  }

  @computed
  get fields(): PetFormFields {
    return {
      '$.alive': {
        value: this.value.alive,
        error: this.errors['$.alive'],
        disabled: false,
      },
      '$.name': {
        value: this.value.name,
        error: this.errors['$.name'],
        disabled: false,
      },
    }
  }

  value: MobxObservable<MutablePet>

  constructor(value: Pet) {
    this.value = mobxCopy<typeof petTypeDef>(petTypeDef, value)
  }
}
