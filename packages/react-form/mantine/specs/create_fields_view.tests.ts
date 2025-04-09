import { type CallbackMapper } from 'mantine/create_fields_view'

describe('createFieldsView', () => {
  describe('CallbackMapper', () => {
    it('maps a root paths', () => {
      type Cm = CallbackMapper<`$`>
      const callbackMapper: Cm = null!
      type Callback = (valuePath: '$') => void
      type MappedCallback = ReturnType<typeof callbackMapper<Callback>>
      expectTypeOf<MappedCallback>().toEqualTypeOf<(valuePath: '$') => void>()
    })

    it('maps a simple paths', () => {
      type Cm = CallbackMapper<`$.x`>
      const callbackMapper: Cm = null!
      type Callback = (valuePath: '$.x.y') => void
      type MappedCallback = ReturnType<typeof callbackMapper<Callback>>
      expectTypeOf<MappedCallback>().toEqualTypeOf<(valuePath: '$.y') => void>()
    })

    it('maps a indexed paths', () => {
      type Cm = CallbackMapper<`$.${number}.x`>
      const callbackMapper: Cm = null!
      type Callback = (valuePath: `$.${number}.x.${number}.y`) => void
      type MappedCallback = ReturnType<typeof callbackMapper<Callback>>
      expectTypeOf<MappedCallback>().toEqualTypeOf<(valuePath: `$.${number}.y`) => void>()
    })
  })
})
