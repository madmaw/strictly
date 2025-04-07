import {
  JsonInput,
  type JsonInputProps,
  NumberInput,
  type NumberInputProps,
  Rating,
  type RatingProps,
  Slider,
  type SliderProps,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/props'
import { type SuppliedValueInputProps } from 'mantine/create_value_input'
import { useMantineFormFields } from 'mantine/hooks'
import {
  type ComponentType,
} from 'react'
import { type Field } from 'types/field'
import {
  NUMBER_INPUT_LABEL,
  SLIDER_LABEL,
} from './value_input_constants'

function ErrorRenderer({ error }: { error: string }) {
  return `error ${error}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoryValueInputProps<V> = SuppliedValueInputProps<V, any>

function Component<
  V,
  P extends StoryValueInputProps<V>,
>({
  ValueInput,
  inputProps,
  ...props
}: FieldsViewProps<{
  $: Field<V, string>,
}> & {
  ValueInput: ComponentType<P>,
} & {
  inputProps: P,
}) {
  const form = useMantineFormFields(props)
  const ValueInputComponent = form.valueInput<'$', P>('$', ValueInput)
  return (
    <ValueInputComponent
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
        ...inputProps as any
      }
      ErrorRenderer={ErrorRenderer}
    />
  )
}

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldSubmit: action('onFieldSubmit'),
    onFieldValueChange: action('onFieldValueChange'),
  },
}

export default meta

type Story<
  V,
  P extends StoryValueInputProps<V>,
> = StoryObj<typeof Component<V, P>>

export const EmptyNumberInput: Story<number | string, NumberInputProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: '',
      },
    },
    ValueInput: NumberInput,
    inputProps: {
      label: NUMBER_INPUT_LABEL,
    },
  },
}

export const PopulatedNumberInput: Story<number | string, NumberInputProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 3,
      },
    },
    ValueInput: NumberInput,
    inputProps: {
      label: NUMBER_INPUT_LABEL,
    },
  },
}

export const RequiredNumberInput: Story<number | string, NumberInputProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: true,
        value: 3,
      },
    },
    ValueInput: NumberInput,
    inputProps: {
      label: NUMBER_INPUT_LABEL,
    },
  },
}

export const ErrorNumberInput: Story<number | string, NumberInputProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 3,
        error: 'an error',
      },
    },
    ValueInput: NumberInput,
    inputProps: {
      label: NUMBER_INPUT_LABEL,
    },
  },
}

export const DisabledNumberInput: Story<number | string, NumberInputProps> = {
  args: {
    fields: {
      $: {
        readonly: true,
        required: false,
        value: 3,
      },
    },
    ValueInput: NumberInput,
    inputProps: {
      label: NUMBER_INPUT_LABEL,
    },
  },
}

export const AnSlider: Story<number, SliderProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 3,
      },
    },
    ValueInput: Slider,
    inputProps: {
      label: SLIDER_LABEL,
      min: 1,
      max: 10,
      marks: [
        {
          value: 1,
          label: 'min',
        },
        {
          value: 5,
          label: 'mid',
        },
        {
          value: 10,
          label: 'max',
        },
      ],
    },
  },
}

export const AnRating: Story<number, RatingProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 2,
      },
    },
    ValueInput: Rating,
    inputProps: {},
  },
}

export const AnJsonInput: Story<string, JsonInputProps> = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: '{}',
      },
    },
    ValueInput: JsonInput,
    inputProps: {
      rows: 8,
    },
  },
}
