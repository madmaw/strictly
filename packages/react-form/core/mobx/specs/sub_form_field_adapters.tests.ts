import { type FieldAdapter } from 'core/mobx/field_adapter'
import {
  subFormFieldAdapters,
} from 'core/mobx/sub_form_field_adapters'
import { mockDeep } from 'vitest-mock-extended'

describe('subFormFieldAdapters', () => {
  const fieldAdapter1: FieldAdapter<string, boolean> = mockDeep()
  const fieldAdapter2: FieldAdapter<number, boolean> = mockDeep()

  describe('empty value', () => {
    const adapters = subFormFieldAdapters({}, '$.a')

    it('equals expected type', () => {
      expectTypeOf(adapters).toEqualTypeOf<{}>()
    })

    it('equals expected value', () => {
      expect(adapters).toEqual({})
    })
  })

  describe('single adapter', () => {
    const adapters = subFormFieldAdapters({
      $: fieldAdapter1,
    }, '$.a')

    it('equals expected type', () => {
      expectTypeOf(adapters).toEqualTypeOf<{
        '$.a': FieldAdapter<string, boolean>,
      }>()
    })

    it('equals expected value', () => {
      expect(adapters).toEqual({ '$.a': fieldAdapter1 })
    })
  })

  describe('multiple adapters', () => {
    const adapters = subFormFieldAdapters({
      '$.x': fieldAdapter1,
      '$.y': fieldAdapter2,
    }, '$.a')

    it('equals expected type', () => {
      expectTypeOf(adapters).toEqualTypeOf<{
        '$.a.x': FieldAdapter<string, boolean>,
        '$.a.y': FieldAdapter<number, boolean>,
      }>()
    })

    it('equals expected value', () => {
      expect(adapters).toEqual({
        '$.a.x': fieldAdapter1,
        '$.a.y': fieldAdapter2,
      })
    })
  })
})
