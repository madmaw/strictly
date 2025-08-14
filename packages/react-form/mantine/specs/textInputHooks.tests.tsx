import { composeStories } from '@storybook/react'
import { toArray } from '@strictly/base'
import {
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react'
import {
  type Mock,
  vi,
} from 'vitest'
import { TEXT_INPUT_LABEL } from './textInputConstants'
import * as stories from './textInputHooks.stories'

const composedStories = composeStories(stories)
const {
  Populated,
} = composedStories

describe('mantine checkbox hooks', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })

  describe('events', function () {
    let onFieldValueChange: Mock<(path: '$', value: string) => void>
    let onFieldFocus: Mock<(path: '$') => void>
    let onFieldBlur: Mock<(path: '$') => void>
    let onFieldSubmit: Mock<(path: '$') => void>
    let wrapper: RenderResult
    let textInput: HTMLElement

    beforeEach(async function () {
      onFieldValueChange = vi.fn()
      onFieldFocus = vi.fn()
      onFieldBlur = vi.fn()
      onFieldSubmit = vi.fn()
      wrapper = render((
        <Populated
          onFieldBlur={onFieldBlur}
          onFieldFocus={onFieldFocus}
          onFieldSubmit={onFieldSubmit}
          onFieldValueChange={onFieldValueChange}
        />
      ))
      textInput = await wrapper.findByLabelText(TEXT_INPUT_LABEL)
    })

    it('fires change event', function () {
      const value = 'new value'
      fireEvent.change(textInput, {
        target: {
          value,
        },
      })
      expect(onFieldValueChange).toHaveBeenCalledOnce()
      expect(onFieldValueChange).toHaveBeenCalledWith('$', value)
    })

    it('fires submit event on enter', function () {
      fireEvent.keyUp(textInput, {
        key: 'Enter',
      })
      expect(onFieldSubmit).toHaveBeenCalledOnce()
      expect(onFieldSubmit).toHaveBeenLastCalledWith('$')
    })

    it.each([
      'Tab',
      'Space',
      'x',
    ])('does not fire submit event on %s', function (key) {
      fireEvent.keyUp(textInput, {
        key,
      })
      expect(onFieldSubmit).not.toHaveBeenCalled()
    })

    describe('focus', function () {
      beforeEach(function () {
        fireEvent.focus(textInput)
      })

      it('fires focus event', function () {
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      describe('blur', function () {
        beforeEach(function () {
          fireEvent.blur(textInput)
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
