import { toArray } from '@de/base'
import { composeStories } from '@storybook/react'
import {
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react'
import {
  type Mock,
  vi,
} from 'vitest'
import {
  RADIO_GROUP_LABEL,
  RADIO_LABELS,
  RADIO_VALUES,
  type RadioValue,
} from './constants'
import * as stories from './radio_group_hooks.stories'

const composedStories = composeStories(stories)
const {
  Empty,
} = composedStories

describe('radio group mantine hooks', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('events', function () {
    let onFieldValueChange: Mock<(path: '$', value: RadioValue) => void>
    let onFieldFocus: Mock<(path: '$') => void>
    let onFieldBlur: Mock<(path: '$') => void>
    let wrapper: RenderResult
    let radioGroup: HTMLElement

    beforeEach(async function () {
      onFieldValueChange = vi.fn()
      onFieldFocus = vi.fn()
      onFieldBlur = vi.fn()
      wrapper = render((
        <Empty
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
          onFieldValueChange={onFieldValueChange}
        />
      ))
      radioGroup = await wrapper.findByLabelText(RADIO_GROUP_LABEL)
    })

    describe.each(RADIO_VALUES)('selects %s', function (value) {
      let radio: HTMLElement
      beforeEach(async function () {
        const label = RADIO_LABELS[value]
        radio = await wrapper.findByLabelText(label)
        fireEvent.click(radio)
      })

      it('fires onFieldValueChange', function () {
        expect(onFieldValueChange).toHaveBeenCalledOnce()
        expect(onFieldValueChange).toHaveBeenCalledWith('$', value)
      })
    })

    describe('focus', function () {
      beforeEach(function () {
        fireEvent.focus(radioGroup)
      })

      it('fires focus event', function () {
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      describe('blur', function () {
        beforeEach(function () {
          fireEvent.blur(radioGroup)
        })

        it('fires blur event', function () {
          expect(onFieldBlur).toHaveBeenCalledOnce()
          expect(onFieldBlur).toHaveBeenCalledWith('$')
        })

        it('does not refire focus event', function () {
          expect(onFieldFocus).toHaveBeenCalledOnce()
        })
      })
    })
  })
})
