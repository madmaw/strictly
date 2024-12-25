import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetSpeciesDogForm } from 'features/form/pet/pet_species_dog_form'
import {
  NOT_A_BREED_ERROR,
  NOT_A_NUMBER_ERROR,
} from 'features/form/pet/types'

const Component = PetSpeciesDogForm

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
      '$.species.dog:barks': {
        disabled: false,
        value: '1',
        required: true,
      },
      '$.species.dog:breed': {
        disabled: false,
        value: 'Alsatian',
        required: true,
      },
    },
  },
}

export const Error: Story = {
  args: {
    fields: {
      '$.species.dog:barks': {
        disabled: false,
        value: '',
        error: NOT_A_NUMBER_ERROR,
        required: true,
      },
      '$.species.dog:breed': {
        disabled: false,
        value: 'Fish',
        error: NOT_A_BREED_ERROR,
        required: true,
      },
    },
  },
}
