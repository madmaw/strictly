import { composeStories } from '@storybook/react-vite'
import { toArray } from '@strictly/base'
import { fireEvent, render } from '@testing-library/react'
import * as stories from './fieldsViewHooks.stories'

const composedStories = composeStories(stories)
const { Empty } = composedStories

describe('field view hooks', () => {
  it.each(toArray(composedStories))('renders %s', (_name, Story) => {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('callbackMapper', () => {
    it.each([
      ['$', stories.parentFieldLabel()],
      ['$.a', stories.subFieldLabel()],
    ])(
      'calls back with the correct paths for field at %s',
      async (valuePath, labelText) => {
        const onClickField = vi.fn()
        const wrapper = render(<Empty onClickField={onClickField} />)
        const element = await wrapper.findByLabelText(labelText)
        fireEvent.click(element)
        expect(onClickField).toHaveBeenCalledOnce()
        expect(onClickField).toHaveBeenCalledWith(valuePath)
      },
    )
  })
})
