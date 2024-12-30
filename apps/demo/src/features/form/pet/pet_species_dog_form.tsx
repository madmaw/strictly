import { t } from '@lingui/core/macro'
import {
  NumberInput,
  Stack,
} from '@mantine/core'
import { toArray } from '@strictly/base'
import {
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import {
  type DogBreed,
  type NOT_A_BREED_ERROR,
  type NOT_A_NUMBER_ERROR,
  type PetValueToTypePaths,
} from './types'

export type PetSpeciesDogFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species.dog:barks': Field<string | number, typeof NOT_A_NUMBER_ERROR>,
    '$.species.dog:breed': Field<string | null, typeof NOT_A_BREED_ERROR>,
  }
>

export type PetSpeciesFormDogProps = FormProps<PetSpeciesDogFormFields>

export function BreedLabel() {
  return t({
    message: 'Breed',
    comment: 'Dog breed',
  })
}

export function BarksLabel() {
  return t({
    message: 'Barks',
    comment: 'label for an input that captures the number of barks a dog has made',
  })
}

const BREED_NAMES: Record<DogBreed, () => string> = {
  Alsatian: () =>
    t({
      message: 'Alsatian',
      comment: 'the dog breed Alsatian',
    }),
  Pug: () =>
    t({
      message: 'Pug',
      comment: 'the dog breed Pug',
    }),
  other: () =>
    t({
      message: 'Other',
      comment: 'catch all for all other dog breeds',
    }),
}

export function PetSpeciesDogForm(props: PetSpeciesFormDogProps) {
  const form = useMantineForm(props)
  // TODO error handling
  const BarksNumberInput = form.valueInput(
    '$.species.dog:barks',
    NumberInput,
  )
  // TODO error handling
  const BreedInput = form.select(
    '$.species.dog:breed',
  )

  return (
    <Stack>
      <BreedInput
        data={toArray(BREED_NAMES).map(function ([
          value,
          label,
        ]) {
          return {
            value,
            label: label(),
          }
        })}
        label={BreedLabel()}
      />
      <BarksNumberInput label={BarksLabel()} />
    </Stack>
  )
}
