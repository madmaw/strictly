import {
  Stack,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FormProps } from 'core/props'
import {
  type ErrorRenderer,
} from 'mantine/error_renderer'
import { useMantineForm } from 'mantine/hooks'
import { type Field } from 'types/field'
import {
  RADIO_GROUP_LABEL,
  RADIO_LABELS,
  RADIO_VALUES,
  type RadioValue,
} from './radio_group_constants'

function Component({
  ErrorRenderer,
  ...props
}: FormProps<{
  $: Field<RadioValue | null, string>,
}> & {
  ErrorRenderer?: ErrorRenderer,
}) {
  const form = useMantineForm(props)
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
        disabled: false,
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
        disabled: false,
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
        disabled: false,
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
        disabled: true,
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
        disabled: false,
        required: false,
        value: '2',
        error: 'error',
      },
    },
  },
}

export const CustomError: Story = {
  args: {
    fields: {
      $: {
        disabled: false,
        required: false,
        value: '2',
        error: 'error',
      },
    },
    ErrorRenderer: function () {
      return 'custom error'
    },
  },
}
