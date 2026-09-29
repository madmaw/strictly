import { composeStories } from '@storybook/react-vite'
import { toArray } from '@strictly/base'
import { textContentOf } from '@strictly/spec'
import { fireEvent, render } from '@testing-library/react'
import { SubmitLabel } from 'features/form/pet/PetFieldsView'
import { vi } from 'vite-plus/test'
import * as stories from './PetFieldsView.stories'

const composedStories = composeStories(stories)
const { Populated } = composedStories

describe('PetFieldsView', () => {
  it.each(toArray(composedStories))('renders %s', (_name, Story) => {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('callbacks', () => {
    it('submits', async () => {
      const onSubmit = vi.fn()
      const wrapper = render(<Populated onSubmit={onSubmit} />)
      const button = await wrapper.findByText(textContentOf(<SubmitLabel />))

      expect(onSubmit).not.toHaveBeenCalled()

      expect(fireEvent.click(button)).toBeTruthy()

      expect(onSubmit).toHaveBeenCalledOnce()
    })
  })
})
