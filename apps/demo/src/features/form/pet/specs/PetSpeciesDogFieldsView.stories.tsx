import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetSpeciesDogFieldsView } from 'features/form/pet/PetSpeciesDogFieldsView'
import {
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
} from 'features/form/pet/Types'

const Component = PetSpeciesDogFieldsView

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldValueChange: action('onFieldValueChange'),
    onFieldSubmit: action('onFieldSubmit'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Valid: Story = {
  args: {
    fields: {
      '$.species:dog.barks': {
        readonly: false,
        value: '1',
        required: true,
      },
      '$.species:dog.breed': {
        readonly: false,
        value: 'Alsatian',
        required: true,
      },
    },
  },
}

export const Error: Story = {
  args: {
    fields: {
      '$.species:dog.barks': {
        readonly: false,
        value: '',
        error: NOT_A_NUMBER_ERROR,
        required: true,
      },
      '$.species:dog.breed': {
        readonly: false,
        value: 'Fish',
        error: NOT_A_BREED_ERROR,
        required: true,
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      '$.species:dog.barks': {
        readonly: true,
        value: '3',
        required: true,
      },
      '$.species:dog.breed': {
        readonly: true,
        value: 'other',
        required: true,
      },
    },
  },
}
