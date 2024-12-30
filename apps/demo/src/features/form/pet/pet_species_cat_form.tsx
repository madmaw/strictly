import { t } from '@lingui/core/macro'
import {
  Slider,
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
  type CatBreed,
  type NOT_A_BREED_ERROR,
  type PetValueToTypePaths,
} from './types'

export type PetSpeciesCatFormFields = FlattenedFormFieldsOf<
  PetValueToTypePaths,
  {
    '$.species.cat:meows': Field<number, never>,
    '$.species.cat:breed': Field<string | null, typeof NOT_A_BREED_ERROR>,
  }
>

export function BreedLabel() {
  return t({
    message: 'Breed',
    comment: 'Input for choosing cat breed',
  })
}

export function MeowsLabel() {
  return t({
    message: 'Meows',
    comment: 'Input capturing the number of times a given cat has meowed',
  })
}

export function MeowFrequencyLow() {
  return t({
    message: 'Quiet',
    comment: 'cat meows infrequently',
  })
}

export function MeowFrequencyModerate() {
  return t({
    message: 'Normal',
    comment: 'meow frequency moderate',
  })
}

export function MeowFrequencyHigh() {
  return t({
    message: 'Noisy',
    comment: 'cat meows often',
  })
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
      comment: 'domestic short hair cat',
    }),
}

export type PetSpeciesFormCatProps = FormProps<PetSpeciesCatFormFields>

export function PetSpeciesCatForm(props: PetSpeciesFormCatProps) {
  const form = useMantineForm(props)
  const MeowsSlider = form.valueInput('$.species.cat:meows', Slider)
  // TODO error rendering
  const BreedSelect = form.select('$.species.cat:breed')
  return (
    <Stack>
      <BreedSelect
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

      <MeowsSlider
        label={MeowsLabel()}
        marks={[
          {
            label: MeowFrequencyLow(),
            value: 0,
          },
          {
            label: MeowFrequencyModerate(),
            value: 5,
          },
          {
            label: MeowFrequencyHigh(),
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
