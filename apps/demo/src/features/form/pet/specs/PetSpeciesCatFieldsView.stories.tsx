import {
  type Meta,
  type StoryObj,
} from '@storybook/react-vite'
import { PetSpeciesCatFieldsView } from 'features/form/pet/PetSpeciesCatFieldsView'
import { NOT_A_BREED_ERROR } from 'features/form/pet/types'
import { action } from 'storybook/actions'

const Component = PetSpeciesCatFieldsView

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
      '$.species:cat.meows': {
        readonly: false,
        value: 1,
        required: true,
      },
      '$.species:cat.breed': {
        readonly: false,
        value: 'Burmese',
        required: true,
      },
    },
  },
}

export const Error: Story = {
  args: {
    fields: {
      '$.species:cat.meows': {
        readonly: false,
        value: 1,
        required: true,
      },
      '$.species:cat.breed': {
        readonly: false,
        value: 'Fish',
        required: true,
        error: NOT_A_BREED_ERROR,
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    fields: {
      '$.species:cat.meows': {
        readonly: true,
        value: 4,
        required: true,
      },
      '$.species:cat.breed': {
        readonly: true,
        value: 'DSH',
        required: true,
      },
    },
  },
}
