import { composeStories } from '@storybook/react'
import { toArray } from '@strictly/base'
import {
  fireEvent,
  render,
} from '@testing-library/react'
import * as stories from './fields_view_hooks.stories'

const composedStories = composeStories(stories)
const {
  Empty,
} = composedStories

describe('field view hooks', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('callbackMapper', () => {
    it.each(
      [
        [
          '$',
          stories.ParentFieldLabel(),
        ],
        [
          '$.a',
          stories.SubFieldLabel(),
        ],
      ],
    )('calls back with the correct paths for field at %s', async (valuePath, labelText) => {
      const onClickField = vi.fn()
      const wrapper = render(<Empty onClickField={onClickField} />)
      const element = await wrapper.findByLabelText(labelText)
      fireEvent.click(element)
      expect(onClickField).toHaveBeenCalledOnce()
      expect(onClickField).toHaveBeenCalledWith(valuePath)
    })
  })
})
