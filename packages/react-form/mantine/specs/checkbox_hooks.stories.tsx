import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FormProps } from 'core/props'
import { useMantineForm } from 'mantine/hooks'
import { type Field } from 'types/field'
import { CHECKBOX_LABEL } from './checkbox_constants'

function Component(props: FormProps<{
  $: Field<boolean, string>,
}>) {
  const inputProps = useMantineForm(props)
  const CheckboxComponent = inputProps.checkbox('$')
  return <CheckboxComponent label={CHECKBOX_LABEL} />
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
