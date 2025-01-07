import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { type FormProps } from 'core/props'
import { type ErrorRenderer } from 'mantine/error_renderer'
import { useMantineForm } from 'mantine/hooks'
import { type Field } from 'types/field'
import { SELECT_LABEL } from './select_hooks_constant'

function Component({
  ErrorRenderer,
  ...props
}: FormProps<{
  $: Field<string | null, string>,
}> & {
  ErrorRenderer?: ErrorRenderer,
}) {
  const form = useMantineForm(props)
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
        disabled: false,
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
        disabled: false,
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
        disabled: false,
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
        disabled: false,
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
        disabled: true,
        required: false,
        value: 'a',
      },
    },
  },
}

export const CustomErrorSelect: Story = {
  args: {
    fields: {
      $: {
        disabled: false,
        required: true,
        value: 'c',
        error: 'error',
      },
    },
    ErrorRenderer: function () {
      return 'custom error'
    },
  },
}
