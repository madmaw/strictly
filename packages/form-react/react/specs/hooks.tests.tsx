import { type ReadonlyRecord } from '@de/fine/util/record'
import {
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react'
import { useFormInput } from 'react/hooks'
import {
  type FormField,
  type FormProps,
} from 'react/props'
import {
  type Mock,
  vitest,
} from 'vitest'

const TEST_ID = 'x'

describe('hooks', function () {
  describe('input', function () {
    type InputFormProps = FormProps<
      ReadonlyRecord<'$', FormField<string, string>>
    >

    function X(props: InputFormProps) {
      const attributes = useFormInput('$', props)
      return (
        <input
          data-testid={TEST_ID}
          {...attributes}
        />
      )
    }

    const onFieldBlur: Mock<(k: '$') => void> = vitest.fn()
    const onFieldFocus: Mock<(k: '$') => void> = vitest.fn()
    const onFieldValueChange: Mock<(k: '$', value: string) => void> = vitest.fn()

    const props: InputFormProps = {
      fields: {
        $: {
          value: 'zzz',
        },
      },
      onFieldBlur,
      onFieldFocus,
      onFieldValueChange,
    }
    beforeEach(function () {
      onFieldBlur.mockReset()
      onFieldFocus.mockReset()
      onFieldValueChange.mockReset()
    })

    it.each([
      'a',
      '',
      'hello world',
    ])('displays the value "%s"', async function (value) {
      const wrapper = render(
        (
          <X
            {...props}
            fields={{
              $: {
                value,
              },
            }}
          />
        ),
      )
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const e = (await wrapper.findByTestId(TEST_ID)) as HTMLInputElement
      expect(e.value).toEqual(value)
    })

    describe('events', function () {
      let wrapper: RenderResult
      let e: HTMLElement
      beforeEach(async function () {
        wrapper = render(
          <X {...props} />,
        )
        e = await wrapper.findByTestId(TEST_ID)
      })

      it('reports focus', function () {
        expect(onFieldFocus).not.toHaveBeenCalled()
        e.focus()
        expect(onFieldFocus).toHaveBeenCalledOnce()
        expect(onFieldFocus).toHaveBeenCalledWith('$')
      })

      it('reports blur', function () {
        e.focus()
        expect(onFieldBlur).not.toHaveBeenCalled()
        e.blur()
        expect(onFieldBlur).toHaveBeenCalledOnce()
        expect(onFieldBlur).toHaveBeenCalledWith('$')
      })

      it.each([
        'x',
        '',
        'asdf',
      ])('reports change to "%s"', function (value) {
        expect(onFieldValueChange).not.toHaveBeenCalled()
        fireEvent.change(e, { target: { value } })
        expect(onFieldValueChange).toHaveBeenCalledOnce()
        expect(onFieldValueChange).toHaveBeenCalledWith('$', value)
      })
    })
  })
})
