import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import {
  MinimumStringLengthValidationErrorType,
  RegexpValidationErrorType,
} from '@strictly/define'
import { PetOwnerFieldsView } from 'features/form/pet/PetOwnerFieldsView'

const Component = PetOwnerFieldsView

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

export const Populated: Story = {
  args: {
    fields: {
      '$.email': {
        readonly: false,
        required: false,
        value: 'email@e.mail',
      },
      '$.firstName': {
        readonly: false,
        required: false,
        value: 'Bob',
      },
      '$.surname': {
        readonly: false,
        required: false,
        value: 'Jane',
      },
      '$.phoneNumber': {
        readonly: false,
        required: true,
        value: '005000500',
      },
    },
  },
}

export const Empty: Story = {
  args: {
    fields: {
      '$.email': {
        readonly: false,
        required: false,
        value: undefined,
      },
      '$.firstName': {
        readonly: false,
        required: false,
        value: '',
      },
      '$.surname': {
        readonly: false,
        required: false,
        value: '',
      },
      '$.phoneNumber': {
        readonly: false,
        required: true,
        value: '',
      },
    },
  },
}

export const Errors: Story = {
  args: {
    fields: {
      '$.email': {
        readonly: false,
        required: false,
        value: 'email@e.mail',
        error: {
          type: RegexpValidationErrorType,
          intent: 'email',
        },
      },
      '$.firstName': {
        readonly: false,
        required: false,
        value: 'Bob',
        error: {
          type: MinimumStringLengthValidationErrorType,
          minimumLength: 3,
          receivedLength: 100,
        },
      },
      '$.surname': {
        readonly: false,
        required: false,
        value: 'Jane',
        error: {
          type: MinimumStringLengthValidationErrorType,
          minimumLength: 3,
          receivedLength: 13,
        },
      },
      '$.phoneNumber': {
        readonly: false,
        required: true,
        value: '005000500',
        error: {
          type: RegexpValidationErrorType,
          intent: 'phone',
        },
      },
    },
  },
}
