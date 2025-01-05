import { flattenValidationErrorsOfType } from 'transformers/flatteners/flatten_validation_errors_of_type'
import { literal } from 'types/builders'
import { type ValueToTypePathsOfType } from 'types/value_to_type_paths_of_type'

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
