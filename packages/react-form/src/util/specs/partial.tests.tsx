import {
  type InputProps,
} from '@mantine/core'
import {
  type ComponentProps,
  type ComponentType,
  type Ref,
} from 'react'
import {
  type UnsafePartialComponent,
} from 'util/Partial'

describe('partial', () => {
  describe('UnsafePartialComponent', () => {
    it('allows a ref of a specific type to be passed', () => {
      type T = UnsafePartialComponent<ComponentType<InputProps>, {}, {}, HTMLInputElement>

      expectTypeOf<ComponentProps<T>['ref']>().toEqualTypeOf<Ref<HTMLInputElement> | undefined>()
    })
  })
})
