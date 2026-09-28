import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { NumberInput, Stack } from '@mantine/core'
import { toArray, UnreachableError } from '@strictly/base'
import { type ErrorRendererProps, type FieldsViewProps, useMantineFormFields } from '@strictly/react-form'
import { type PetFields } from './fields'
import { type DogBreed, NOT_A_BREED_ERROR, REQUIRED_ERROR } from './types'

export type PetSpeciesDogFields = Pick<PetFields, '$.species:dog.barks' | '$.species:dog.breed'>

export type PetSpeciesDogFieldsViewProps = FieldsViewProps<PetSpeciesDogFields>

export function breedLabel() {
  return t({
    message: 'Breed',
    comment: 'Dog breed',
  })
}

export function barksLabel() {
  return t({
    message: 'Barks',
    comment: 'label for an input that captures the number of barks a dog has made',
  })
}

function BreedInputErrorRenderer({ error }: ErrorRendererProps<PetSpeciesDogFields, '$.species:dog.breed'>) {
  switch (error) {
    case NOT_A_BREED_ERROR:
      return (
        <Trans comment='error that is displayed when an invalid breed is selected'>Not a recognized dog breed</Trans>
      )
    case REQUIRED_ERROR:
      return <Trans comment='error that is displayed when no breed is selected'>Must specify a breed</Trans>
    default:
      throw new UnreachableError(error)
  }
}

function BarksInputErrorRenderer() {
  return (
    <Trans comment='error that is displayed when the user enters a number of barks that is not a number'>
      Number of barks must be a number
    </Trans>
  )
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

export function PetSpeciesDogFieldsView(props: PetSpeciesDogFieldsViewProps) {
  const form = useMantineFormFields(props)
  const BarksNumberInput = form.valueInput('$.species:dog.barks', NumberInput)
  const BreedInput = form.select('$.species:dog.breed')

  return (
    <Stack>
      <BreedInput
        ErrorRenderer={BreedInputErrorRenderer}
        data={toArray(BREED_NAMES).map(function ([value, label]) {
          return {
            value,
            label: label(),
          }
        })}
        label={breedLabel()}
      />
      <BarksNumberInput ErrorRenderer={BarksInputErrorRenderer} label={barksLabel()} />
    </Stack>
  )
}
