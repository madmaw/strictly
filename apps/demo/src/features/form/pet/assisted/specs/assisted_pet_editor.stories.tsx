import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { AssistedPetEditor } from 'features/form/pet/assisted/assisted_pet_editor'

const Component = AssistedPetEditor

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onValueChange: action('onValueChange'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Valid: Story = {
  args: {
    value: {
      alive: true,
      name: 'Delta',
      species: {
        type: 'cat',
        meows: 2,
      },
    },
  },
}

export const Invalid: Story = {
  args: {
    value: {
      alive: true,
      name: 'D',
      species: {
        type: 'cat',
        meows: 2,
      },
    },
  },
}
