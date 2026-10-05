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
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { type FieldsViewProps } from 'form/core/props'
import { type SuppliedValueInputProps } from 'form/mantine/createValueInput'
import { useMantineFormFields } from 'form/mantine/hooks'
import { type Field } from 'form/types/Field'
import { type ComponentType } from 'react'
import { action } from 'storybook/actions'
import { NUMBER_INPUT_LABEL, SLIDER_LABEL } from './valueInputConstants'

function ErrorRenderer({ error }: { error: string }) {
  return `error ${error}`
}

// oxlint-disable-next-line typescript/no-explicit-any
type StoryValueInputProps<V> = SuppliedValueInputProps<V, any>

function Component<V, P extends StoryValueInputProps<V>>({
  ValueInput,
  inputProps,
  ...props
}: FieldsViewProps<{
  $: Field<V, string>
}> & {
  ValueInput: ComponentType<P>
} & {
  inputProps: P
}) {
  const form = useMantineFormFields(props)
  const ValueInputComponent = form.valueInput<'$', P>('$', ValueInput)
  return (
    <ValueInputComponent
      {
        // oxlint-disable-next-line typescript/no-explicit-any
        ...(inputProps as any)
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

type Story<V, P extends StoryValueInputProps<V>> = StoryObj<
  typeof Component<V, P>
>

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
