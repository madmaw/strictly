import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FieldsViewProps } from 'core/props'
import { useMantineFormFields } from 'mantine/hooks'
import { type Field } from 'types/field'
import { SELECT_LABEL } from './select_hooks_constant'

function ErrorRenderer({ error }: { error: string }) {
  return `Error ${error}`
}

function Component({
  ...props
}: FieldsViewProps<{
  $: Field<string | null, string>,
}>) {
  const form = useMantineFormFields(props)
  const SelectComponent = form.select('$')
  return (
    <SelectComponent
      ErrorRenderer={ErrorRenderer}
      data={[
        'a',
        'b',
        'c',
      ]}
      label={SELECT_LABEL}
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

export const EmptySelect: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: '',
      },
    },
  },
}

export const PopulatedSelect: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'a',
      },
    },
  },
}

export const InvalidSelect: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: false,
        value: 'd',
        error: 'invalid option',
      },
    },
  },
}

export const RequiredSelect: Story = {
  args: {
    fields: {
      $: {
        readonly: false,
        required: true,
        value: 'a',
      },
    },
  },
}

export const DisabledSelect: Story = {
  args: {
    fields: {
      $: {
        readonly: true,
        required: false,
        value: 'a',
      },
    },
  },
}
