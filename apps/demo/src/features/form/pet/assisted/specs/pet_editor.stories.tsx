import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetEditor } from 'features/form/pet/assisted/pet_editor'

const Component = PetEditor

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onValueChange: action('onValueChange'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Empty: Story = {
  args: {
    value: {
      alive: false,
      name: '',
      tags: [],
      species: {
        type: 'cat',
        meows: 0,
      },
    },
  },
}

export const Valid: Story = {
  args: {
    value: {
      alive: true,
      name: 'Delta',
      tags: [
        'black',
        'nervous',
      ],
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
      tags: ['white'],
      species: {
        type: 'cat',
        meows: 2,
      },
    },
  },
}
