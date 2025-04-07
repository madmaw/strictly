import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/props'
import { useMantineFormFields } from 'mantine/hooks'
import { type Field } from 'types/field'
import { CHECKBOX_LABEL } from './checkbox_constants'

function ErrorRenderer({ error }: { error: string }) {
  return `Error ${error}`
}

function Component({
  ...props
}: FieldsViewProps<{
  $: Field<boolean, string>,
}>) {
  const inputProps = useMantineFormFields(props)
  const CheckboxComponent = inputProps.checkbox('$')
  return (
    <CheckboxComponent
      ErrorRenderer={ErrorRenderer}
      label={CHECKBOX_LABEL}
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
        readonly: false,
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
        readonly: false,
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
        readonly: false,
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
        readonly: true,
        required: false,
        value: false,
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
        value: true,
        error: 'error',
      },
    },
  },
}
