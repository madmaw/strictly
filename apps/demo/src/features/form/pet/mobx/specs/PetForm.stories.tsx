import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import {
  userEvent,
  within,
} from '@storybook/test'
import { delay } from '@strictly/base'
import { PetForm } from 'features/form/pet/mobx/PetForm'
import { SubmitLabel } from 'features/form/pet/PetFieldsView'

const Component = PetForm

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    forceMutable: false,
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

    onValueChange: action('onValueChange'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Valid: Story = {
  args: {},
}

export const Unalive: Story = {
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

export const CreateMode: Story = {
  args: {
    forceMutable: true,
    value: {
      alive: true,
      name: '',
      tags: [],
      species: {
        type: 'cat',
        meows: 0,
      },
    },
  },
}

export const Invalid: Story = {
  args: {
    forceMutable: true,
    value: {
      alive: true,
      name: 'delta',
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
    // can't consistently find the submit button!
    await delay(100)
    const submitButton = canvas.getByText(SubmitLabel())
    await userEvent.click(submitButton)
  },
}
