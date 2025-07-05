import { flattenValidationErrorsOfType } from 'transformers/flatteners/flattenValidationErrorsOfType'
import { literal } from 'types/builders'
import { type ValueToTypePathsOfType } from 'types/ValueToTypePathsOfType'

describe('flattenValidationsOfType', function () {
  describe('literal', function () {
    const type = literal<'a' | 'b' | 'c'>()
    describe('failures', function () {
      const validators = {
        $: () => 'error',
      }

      const errors = flattenValidationErrorsOfType<
        typeof type,
        ValueToTypePathsOfType<typeof type>,
        typeof validators
      >(
        type,
        'a',
        validators,
      )

      it('reports an error', function () {
        expect(errors.$).toBe('error')
      })
    })

    describe('success', function () {
      const validators = {
        $: () => null,
      }

      const errors = flattenValidationErrorsOfType<
        typeof type,
        ValueToTypePathsOfType<typeof type>,
        typeof validators
      >(
        type,
        'a',
        validators,
      )

      it('reports no error', function () {
        expect(errors.$).toBe(null)
      })
    })
  })
})
