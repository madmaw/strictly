import { Stack } from '@mantine/core'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { type FieldsViewProps } from 'core/props'
import { type ErrorRenderer } from 'mantine/ErrorRenderer'
import { useMantineFormFields } from 'mantine/hooks'
import { action } from 'storybook/actions'
import { type Field } from 'types/Field'
import {
  RADIO_GROUP_LABEL,
  RADIO_LABELS,
  RADIO_VALUES,
  type RadioValue,
} from './radioGroupConstants'

function ErrorRenderer({ error }: { error: string }) {
  return `custom error ${error}`
}

function Component({
  ...props
}: FieldsViewProps<{
  $: Field<RadioValue | null, string>
}>) {
  const form = useMantineFormFields(props)
  const RadioGroupComponent = form.radioGroup('$')

  return (
    <RadioGroupComponent
      ErrorRenderer={ErrorRenderer}
      label={RADIO_GROUP_LABEL}
    >
      <Stack>
        {RADIO_VALUES.map((value: RadioValue) => {
          const label = RADIO_LABELS[value]
          const RadioComponent = form.radio('$', value)
          // individual radios cannot display an error, so they take no error renderer
          return (
            <RadioComponent
              key={label}
              label={label}
            />
          )
        })}
      </Stack>
    </RadioGroupComponent>
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

type Story = StoryObj<typeof Component>

export const Empty: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: null,
      },
    },
  },
}

export const Populated: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: '3',
      },
    },
  },
}

export const Required: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: true,
        value: '1',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      $: {
        readonly: true,
        required: false,
        value: '2',
      },
    },
  },
}

export const Error: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: '2',
        error: 'error',
      },
    },
  },
}
