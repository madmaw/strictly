import {
  numberType,
  object,
  stringType,
} from '@strictly/define'
import { type FieldAdapter } from 'core/mobx/field_adapter'
import {
  subFormFieldAdapters,
} from 'core/mobx/sub_form_field_adapters'
import { UnreliableFieldConversionType } from 'types/field_converters'
import { mockDeep } from 'vitest-mock-extended'

describe('subFormFieldAdapters', () => {
  const mockedFieldAdapter1 = mockDeep<Required<FieldAdapter<string, boolean>>>()
  const fieldAdapter1: FieldAdapter<string, boolean> = mockedFieldAdapter1
  const mockedFieldAdapter2 = mockDeep<FieldAdapter<number, boolean>>()
  const fieldAdapter2: FieldAdapter<number, boolean> = mockedFieldAdapter2

  describe('empty value', () => {
    const adapters = subFormFieldAdapters({}, '$.a', stringType)

    it('equals expected type', () => {
      expectTypeOf(adapters).toEqualTypeOf<{}>()
    })

    it('equals expected value', () => {
      expect(adapters).toEqual({})
    })
  })

  describe('single adapter', () => {
    const type = object().field('a', stringType)
    const adapters = subFormFieldAdapters({
      $: fieldAdapter1,
    }, '$.a', type)

    it('equals expected type', () => {
      // TODO toEqualTypeOf (seems to be a TS error)
      expectTypeOf(adapters).toMatchTypeOf<{
        '$.a': FieldAdapter<string, boolean>,
      }>()
    })

    it('equals expected value', () => {
      expect(adapters).toEqual({ '$.a': expect.anything() })
    })

    it('calls convert with the correct paths and values', () => {
      const mockedReturnedValue = {
        value: false,
        required: false,
        readonly: false,
      }
      mockedFieldAdapter1.convert.mockReturnValue(mockedReturnedValue)

      const returnedValue = adapters['$.a'].convert('x', '$.a', { a: 'y' })
      expect(fieldAdapter1.convert).toHaveBeenCalledWith('x', '$', 'y')
      expect(returnedValue).toEqual(mockedReturnedValue)
    })

    it('calls revert with the correct paths and values', () => {
      const mockedReturnedValue = {
        type: UnreliableFieldConversionType.Success,
        value: 'ok',
      } as const
      mockedFieldAdapter1.revert.mockReturnValue(mockedReturnedValue)

      const returnedValue = adapters['$.a'].revert?.(true, '$.a', { a: 'y' })
      expect(fieldAdapter1.revert).toHaveBeenCalledWith(true, '$', 'y')
      expect(returnedValue).toEqual(mockedReturnedValue)
    })

    it('calls create with the correct paths and values', () => {
      const mockedReturnedValue = 'x'
      mockedFieldAdapter1.create.mockReturnValue(mockedReturnedValue)

      const returnedValue = adapters['$.a'].create('$.a', { a: 'y' })
      expect(fieldAdapter1.create).toHaveBeenCalledWith('$', 'y')
      expect(returnedValue).toEqual(mockedReturnedValue)
    })
  })

  describe('multiple adapters', () => {
    const type = object()
      .field('a', object().field('x', stringType).field('y', numberType))
    const adapters = subFormFieldAdapters({
      '$.x': fieldAdapter1,
      '$.y': fieldAdapter2,
    }, '$.a', type)

    it('equals expected type', () => {
      // TODO toEqualTypeOf (seems to be a TS error)
      expectTypeOf(adapters).toMatchTypeOf<{
        '$.a.x': FieldAdapter<string, boolean>,
        '$.a.y': FieldAdapter<number, boolean>,
      }>()
    })

    it('equals expected value', () => {
      expect(adapters).toEqual({
        '$.a.x': expect.anything(),
        '$.a.y': expect.anything(),
      })
    })

    describe('calls convert with correct paths and values', () => {
      const subContext = {
        x: 'a',
        y: 1,
      } as const
      const context = {
        a: subContext,
      }

      it('calls $.a.x', () => {
        const mockedReturnedValue = {
          value: true,
          readonly: true,
          required: false,
        }
        mockedFieldAdapter1.convert.mockReturnValue(mockedReturnedValue)

        const returnedValue = adapters['$.a.x'].convert('b', '$.a.x', context)
        expect(fieldAdapter1.convert).toHaveBeenCalledWith('b', '$.x', subContext)
        expect(returnedValue).toEqual(mockedReturnedValue)
      })

      it('calls $.a.y', () => {
        const mockedReturnedValue = {
          value: false,
          readonly: false,
          required: false,
        }
        mockedFieldAdapter2.convert.mockReturnValue(mockedReturnedValue)

        const returnedValue = adapters['$.a.y'].convert(2, '$.a.y', context)
        expect(fieldAdapter2.convert).toHaveBeenCalledWith(2, '$.y', subContext)
        expect(returnedValue).toEqual(mockedReturnedValue)
      })
    })
  })
})
