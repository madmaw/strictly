import { composeStories } from '@storybook/react'
import { toArray } from '@strictly/base'
import {
  fireEvent,
  render,
} from '@testing-library/react'
import { SubmitLabel } from 'features/form/pet/pet_fields_view'
import { vi } from 'vitest'
import * as stories from './pet_fields_view.stories'

const composedStories = composeStories(stories)
const {
  Populated,
} = composedStories

describe('PetFieldsView', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('callbacks', function () {
    it('submits', async function () {
      const onSubmit = vi.fn()
      const wrapper = render(<Populated onSubmit={onSubmit} />)
      const button = await wrapper.findByText(SubmitLabel())

      expect(onSubmit).not.toHaveBeenCalled()

      expect(fireEvent.click(button)).toBeTruthy()

      expect(onSubmit).toHaveBeenCalledOnce()
    })
  })
})
