import { flattenValidationErrorsOfType } from 'define/transformers/flatteners/flattenValidationErrorsOfType'
import { literal } from 'define/types/builders'
import { type ValueToTypePathsOfType } from 'define/types/ValueToTypePathsOfType'

describe('flattenValidationErrorsOfType', () => {
  describe('literal', () => {
    const type = literal<'a' | 'b' | 'c'>().narrow
    describe('failures', () => {
      const validators = {
        $: () => 'error',
      }

      const errors = flattenValidationErrorsOfType<
        typeof type,
        ValueToTypePathsOfType<typeof type>,
        typeof validators
      >(type, 'a', validators)

      it('reports an error', () => {
        expect(errors.$).toBe('error')
      })
    })

    describe('success', () => {
      const validators = {
        $: () => null,
      }

      const errors = flattenValidationErrorsOfType<
        typeof type,
        ValueToTypePathsOfType<typeof type>,
        typeof validators
      >(type, 'a', validators)

      it('reports no error', () => {
        expect(errors.$).toBe(null)
      })
    })
  })
})
