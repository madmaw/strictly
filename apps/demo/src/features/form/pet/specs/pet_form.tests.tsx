import { toArray } from '@de/base'
import { composeStories } from '@storybook/react'
import {
  fireEvent,
  render,
} from '@testing-library/react'
import { LABEL_SUBMIT } from 'features/form/pet/pet_form'
import { vi } from 'vitest'
import * as stories from './pet_form.stories'

const composedStories = composeStories(stories)
const {
  Populated,
} = composedStories

describe('PetForm', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('callbacks', function () {
    it('submits', async function () {
      const onSubmit = vi.fn()
      const wrapper = render(<Populated onSubmit={onSubmit} />)
      const button = await wrapper.findByText(LABEL_SUBMIT)

      expect(onSubmit).not.toHaveBeenCalled()

      expect(fireEvent.click(button)).toBeTruthy()

      expect(onSubmit).toHaveBeenCalledOnce()
    })
  })
})
