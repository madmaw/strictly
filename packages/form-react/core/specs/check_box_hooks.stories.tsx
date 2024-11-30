import {
  Checkbox,
} from '@mantine/core'
import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { useFormCheckBox } from 'core/hooks'
import { type FormProps } from 'core/props'
import { type Field } from 'types/field'

function Component(props: FormProps<{
  $: Field<string, boolean>,
}>) {
  const inputProps = useFormCheckBox('$', props)
  return (
    <Checkbox
      {...inputProps}
      label='Checkbox'
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

type Story = StoryObj<typeof Component>

export const Off: Story = {
  args: {
    fields: {
      $: {
        disabled: false,
        required: false,
        value: false,
      },
    },
  },
}

export const On: Story = {
  args: {
    fields: {
      $: {
        disabled: false,
        required: false,
        value: true,
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
        value: false,
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
        value: false,
      },
    },
  },
}
