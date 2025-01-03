import { t } from '@lingui/core/macro'
import {
  NumberInput,
  Stack,
} from '@mantine/core'
import {
  toArray,
  UnreachableError,
} from '@strictly/base'
import {
  type ErrorRendererProps,
  type Field,
  type FlattenedFormFieldsOf,
  type FormProps,
  useMantineForm,
} from '@strictly/react-form'
import { type ErrorTypeOfField } from '@strictly/react-form'
import {
  type DogBreed,
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
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

function BreedInputErrorRenderer({
  error,
}: ErrorRendererProps<ErrorTypeOfField<PetSpeciesDogFormFields['$.species.dog:breed']>>) {
  switch (error) {
    case NOT_A_BREED_ERROR:
      return t({
        message: 'Not a recognized dog breed',
        comment: 'error that is displayed when an invalid breed is selected',
      })
    default:
      throw new UnreachableError(error)
  }
}

function BarksInputErrorRenderer({
  error,
}: {
  error: ErrorTypeOfField<PetSpeciesDogFormFields['$.species.dog:barks']>,
}) {
  switch (error) {
    case NOT_A_NUMBER_ERROR:
      return t({
        message: 'Number of barks must be a number',
        comment: 'error that is displayed when the user enters a number of barks that is not a number',
      })
    default:
      throw new UnreachableError(error)
  }
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
  const BarksNumberInput = form.valueInput(
    '$.species.dog:barks',
    NumberInput,
  )
  const BreedInput = form.select(
    '$.species.dog:breed',
  )

  return (
    <Stack>
      <BreedInput
        ErrorRenderer={BreedInputErrorRenderer}
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
      <BarksNumberInput
        ErrorRenderer={BarksInputErrorRenderer}
        label={BarksLabel()}
      />
    </Stack>
  )
}
