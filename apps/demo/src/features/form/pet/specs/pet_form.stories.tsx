import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetForm } from 'features/form/pet/pet_form'

const Component = PetForm

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldValueChange: action('onFieldValueChange'),
    onSubmit: action('onSubmit'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Populated: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: 'Fido',
      },
      '$.alive': {
        disabled: false,
        value: true,
      },
    },
  },
}

export const Empty: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: '',
      },
      '$.alive': {
        disabled: false,
        value: false,
      },
    },
  },
}

export const Errors: Story = {
  args: {
    fields: {
      '$.name': {
        disabled: false,
        value: 'Bad',
        error: 'this name is bad',
      },
      '$.alive': {
        disabled: false,
        value: false,
        error: 'this status is bad',
      },
    },
  },
}
