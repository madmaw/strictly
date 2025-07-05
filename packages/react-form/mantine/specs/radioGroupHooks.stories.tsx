import {
  Stack,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/Props'
import {
  type ErrorRenderer,
} from 'mantine/ErrorRenderer'
import { useMantineFormFields } from 'mantine/hooks'
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
  $: Field<RadioValue | null, string>,
}>) {
  const form = useMantineFormFields(props)
  const RadioGroupComponent = form.radioGroup('$')

  return (
    <RadioGroupComponent
      ErrorRenderer={ErrorRenderer}
      label={RADIO_GROUP_LABEL}
    >
      <Stack>
        {RADIO_VALUES.map(function (value: RadioValue) {
          const label = RADIO_LABELS[value]
          const RadioComponent = form.radio('$', value)
          return (
            <RadioComponent
              ErrorRenderer={ErrorRenderer}
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
