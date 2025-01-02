import { flattenValidationsOfType } from 'transformers/flatteners/flatten_validations_of_type'
import { literal } from 'types/builders'
import { type ValueToTypePathsOf } from 'types/value_to_type_paths_of'

describe('flattenValidationsOfType', function () {
  describe('literal', function () {
    const type = literal<'a' | 'b' | 'c'>()
    describe('failures', function () {
      const validators = {
        $: () => 'error',
      }

      const errors = flattenValidationsOfType<
        typeof type,
        ValueToTypePathsOf<typeof type>,
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

      const errors = flattenValidationsOfType<
        typeof type,
        ValueToTypePathsOf<typeof type>,
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
