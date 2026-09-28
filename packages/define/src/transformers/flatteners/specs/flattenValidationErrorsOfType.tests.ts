import { flattenValidationErrorsOfType } from 'transformers/flatteners/flattenValidationErrorsOfType'
import { literal } from 'types/builders'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'

describe('flattenValidationsOfType', () => {
  describe('literal', () => {
    const type = literal<'a' | 'b' | 'c'>()
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
