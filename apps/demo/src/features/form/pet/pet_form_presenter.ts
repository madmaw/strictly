import { mobxCopy } from '@de/fine/transformers/copies/mobx_copy'
import { type MobxObservable } from '@de/fine/types/mobx_value_type_of'
import {
  computed,
  observable,
  runInAction,
} from 'mobx'
import {
  type FlattenedPetAccessors,
  type FlattenedPetJsonValueToTypePaths,
  type FlattenedPetValueTypes,
  type MutablePet,
  type Pet,
  type PetFields,
  petTypeDef,
  type PetValuePaths,
} from './types'

export class PetFormPresenter {
  constructor() {
  }

  onFieldValueChange<P extends PetValuePaths>(
    model: PetFormModel,
    path: P,
    value: FlattenedPetValueTypes[FlattenedPetJsonValueToTypePaths[P]],
  ) {
    runInAction(function () {
      delete model.errors[path]
      // types should match but a cast is necessary here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      model.accessors[path].set(value as any)
    })
  }

  validate({
    errors,
    value: {
      name,
    },
  }: PetFormModel) {
    runInAction(function () {
      if (name == null || name.trim().length < 2) {
        errors['$.name'] = 'name too short'
      }
    })
  }
}

export class PetFormModel {
  @observable.shallow
  accessor errors: Partial<Record<PetValuePaths, string>> = {}

  @computed
  get accessors(): FlattenedPetAccessors {
    return {
      $: {
        get: () => {
          return this.value
        },
        set: (value: Pet) => {
          this.value = mobxCopy<typeof petTypeDef>(petTypeDef, value)
        },
      },
      '$.alive': {
        get: () => {
          return this.value.alive
        },
        set: (value: boolean) => {
          this.value.alive = value
        },
      },
      '$.name': {
        get: () => {
          return this.value.name
        },
        set: (value: string) => {
          this.value.name = value
        },
      },
    }
  }

  @computed
  get fields(): PetFields {
    return {
      $: {
        value: this.value,
        error: this.errors['$'],
        disabled: false,
      },
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
