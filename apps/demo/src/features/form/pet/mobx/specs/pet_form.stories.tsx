import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import {
  userEvent,
  within,
} from '@storybook/test'
import { PetForm } from 'features/form/pet/mobx/pet_form'
import { SubmitLabel } from 'features/form/pet/pet_fields_view'

const Component = PetForm

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
        breed: 'DSH',
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
      owner: {
        firstName: '',
        surname: '',
        phoneNumber: '',
      },
      species: {
        type: 'cat',
        meows: 2,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const submitButton = canvas.getByText(SubmitLabel())
    await userEvent.click(submitButton)
  },
}
