import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Slider, Stack } from '@mantine/core'
import { toArray, UnreachableError } from '@strictly/base'
import {
  type ErrorRendererProps,
  type FieldsViewProps,
  useMantineFormFields,
} from '@strictly/react-form'
import { type PetFields } from './fields'
import { type CatBreed, NOT_A_BREED_ERROR, REQUIRED_ERROR } from './types'

export type PetSpeciesCatFields = Pick<
  PetFields,
  '$.species:cat.meows' | '$.species:cat.breed'
>

export function BreedLabel() {
  return <Trans comment='Input for choosing cat breed'>Breed</Trans>
}

export function MeowsLabel() {
  return (
    <Trans comment='Input capturing the number of times a given cat has meowed'>
      Meows
    </Trans>
  )
}

export function MeowFrequencyLow() {
  return <Trans comment='cat meows infrequently'>Quiet</Trans>
}

export function MeowFrequencyModerate() {
  return <Trans comment='meow frequency moderate'>Normal</Trans>
}

export function MeowFrequencyHigh() {
  return <Trans comment='cat meows often'>Noisy</Trans>
}

function BreedInputErrorRenderer({
  error,
}: ErrorRendererProps<PetSpeciesCatFields, '$.species:cat.breed'>) {
  switch (error) {
    case NOT_A_BREED_ERROR:
      return (
        <Trans comment='error that is displayed when an invalid breed is selected'>
          Not a recognized cat breed
        </Trans>
      )
    case REQUIRED_ERROR:
      return (
        <Trans comment='error that is displayed when no breed is selected'>
          Must specify a breed
        </Trans>
      )
    default:
      throw new UnreachableError(error)
  }
}

const BREED_NAMES: Record<CatBreed, () => string> = {
  Burmese: () =>
    t({
      message: 'Burmese',
      comment: 'the cat breed Burmese',
    }),
  Siamese: () =>
    t({
      message: 'Siamese',
      comment: 'the cat breed Siamese',
    }),
  ['DSH']: () =>
    t({
      message: 'Domestic Short Hair',
      comment: 'domestic short hair cat breed',
    }),
}

export type PetSpeciesCatFormFieldsViewProps =
  FieldsViewProps<PetSpeciesCatFields>

export function PetSpeciesCatFieldsView(
  props: PetSpeciesCatFormFieldsViewProps,
) {
  const form = useMantineFormFields(props)
  const MeowsSlider = form.valueInput('$.species:cat.meows', Slider)
  const BreedSelect = form.select('$.species:cat.breed')
  return (
    <Stack>
      <BreedSelect
        ErrorRenderer={BreedInputErrorRenderer}
        data={toArray(BREED_NAMES).map(([value, label]) => ({
          value,
          label: label(),
        }))}
        label=<BreedLabel />
      />

      <MeowsSlider
        label=<MeowsLabel />
        marks={[
          {
            label: <MeowFrequencyLow />,
            value: 0,
          },
          {
            label: <MeowFrequencyModerate />,
            value: 5,
          },
          {
            label: <MeowFrequencyHigh />,
            value: 10,
          },
        ]}
        max={10}
        min={0}
        pb='xl'
      />
    </Stack>
  )
}
