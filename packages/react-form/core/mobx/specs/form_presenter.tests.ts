import { expectDefinedAndReturn } from '@strictly/base'
import {
  booleanType,
  type FlattenedValuesOfType,
  list,
  nullType,
  numberType,
  object,
  record,
  stringType,
  union,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import { type FieldAdapter } from 'core/mobx/field_adapter'
import {
  adapterFromTwoWayConverter,
  identityAdapter,
} from 'core/mobx/field_adapter_builder'
import {
  type FlattenedTypePathsToAdaptersOf,
  FormModel,
  FormPresenter,
  type ValuePathsToAdaptersOf,
} from 'core/mobx/form_presenter'
import { IntegerToStringConverter } from 'field_converters/integer_to_string_converter'
import { NullableToBooleanConverter } from 'field_converters/nullable_to_boolean_converter'
import { SelectDiscriminatedUnionConverter } from 'field_converters/select_value_type_converter'
import { prototypingFieldValueFactory } from 'field_value_factories/prototyping_field_value_factory'
import { type Simplify } from 'type-fest'
import { type Field } from 'types/field'
import {
  UnreliableFieldConversionType,
} from 'types/field_converters'
import {
  createMockedAdapter,
  resetMockAdapter,
} from './fixtures'

const IS_NAN_ERROR = 1

const originalIntegerToStringAdapter = adapterFromTwoWayConverter(
  new IntegerToStringConverter(IS_NAN_ERROR),
  prototypingFieldValueFactory(0),
)

const originalBooleanToBooleanAdapter = identityAdapter(false)

describe('all', function () {
  const integerToStringAdapter = createMockedAdapter(
    originalIntegerToStringAdapter,
  )
  const booleanToBooleanAdapter = createMockedAdapter(
    originalBooleanToBooleanAdapter,
  )

  beforeEach(function () {
    resetMockAdapter(originalIntegerToStringAdapter, integerToStringAdapter)
    resetMockAdapter(originalBooleanToBooleanAdapter, booleanToBooleanAdapter)
  })

  describe('FlattenedTypePathsToConvertersOf', function () {
    type ConvenientFieldAdapter<
      From,
      Context,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      To = any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      E = any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ValuePath extends string = any,
    > = FieldAdapter<
      From,
      To,
      E,
      ValuePath,
      Context
    >

    describe('record', function () {
      const typeDef = record<typeof numberType, 'a' | 'b'>(numberType)
      type T = Simplify<
        FlattenedTypePathsToAdaptersOf<
          FlattenedValuesOfType<typeof typeDef>,
          ValueOfType<typeof typeDef>
        >
      >
      type C = Partial<{
        readonly $: ConvenientFieldAdapter<Readonly<Record<'a' | 'b', number>>, ValueOfType<typeof typeDef>>,
        readonly ['$.a']: ConvenientFieldAdapter<number, ValueOfType<typeof typeDef>>,
        readonly ['$.b']: ConvenientFieldAdapter<number, ValueOfType<typeof typeDef>>,
      }>

      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('object', function () {
      const typeDef = object()
        .field('x', stringType)
        .field('y', booleanType)
      type T = FlattenedTypePathsToAdaptersOf<
        FlattenedValuesOfType<typeof typeDef>,
        ValueOfType<typeof typeDef>
      >
      type C = Partial<{
        readonly $: ConvenientFieldAdapter<{ readonly x: string, readonly y: boolean }, ValueOfType<typeof typeDef>>,
        readonly ['$.x']: ConvenientFieldAdapter<string, ValueOfType<typeof typeDef>>,
        readonly ['$.y']: ConvenientFieldAdapter<boolean, ValueOfType<typeof typeDef>>,
      }>
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })

      it('matches representative adapters', function () {
        type A = {
          '$.x': FieldAdapter<string, string>,
          '$.y': FieldAdapter<boolean, string>,
        }
        expectTypeOf<A>().toMatchTypeOf<T>()
      })

      it('does not allow mismatched adapters', function () {
        type A = {
          '$.x': FieldAdapter<boolean, string, Record<string, Field>>,
          '$.y': FieldAdapter<string, string, Record<string, Field>>,
        }
        expectTypeOf<A>().not.toMatchTypeOf<T>()
      })
    })
  })

  describe('ValuePathsToAdaptersOf', function () {
    describe('superset', function () {
      type A = {
        '$.x': FieldAdapter<number, string, string, '$.a'>,
        '$.y': FieldAdapter<boolean, boolean, string, '$.b'>,
      }
      const valuePathsToTypePaths = {
        $: '$',
        '$.a': '$.x',
        '$.b': '$.y',
        '$.c': '$.z',
      } as const
      type T = ValuePathsToAdaptersOf<
        A,
        typeof valuePathsToTypePaths
      >
      type C = {
        readonly '$.a': A['$.x'],
        readonly '$.b': A['$.y'],
      }
      it('equals expected type', function () {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('FormModel', function () {
    describe('literal', function () {
      describe('optional', function () {
        const typeDef = numberType
        const adapters = {
          $: integerToStringAdapter,
        } as const
        let originalValue: ValueOfType<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >
        beforeEach(function () {
          originalValue = 5
          model = new FormModel<
            typeof typeDef,
            ValueToTypePathsOfType<typeof typeDef>,
            typeof adapters
          >(
            typeDef,
            originalValue,
            adapters,
          )
        })

        describe('accessors', function () {
          it('gets the expected value', function () {
            const accessor = expectDefinedAndReturn(model.accessors.$)
            expect(accessor.value).toEqual(originalValue)
          })

          it('sets the underlying value', function () {
            const newValue = 1
            const accessor = expectDefinedAndReturn(model.accessors.$)
            accessor.set(newValue)
            expect(model.value).toEqual(newValue)
          })
        })

        describe('fields', function () {
          it('equals expected value', function () {
            expect(model.fields).toEqual(
              expect.objectContaining({
                $: expect.objectContaining({
                  value: '5',
                }),
              }),
            )
          })

          it('has the expected keys', function () {
            expect(Object.keys(model.fields)).toEqual(['$'])
          })
        })
      })

      describe('required', function () {
        const typeDef = numberType
        const adapters = {
          $: integerToStringAdapter,
        } as const
        let originalValue: ValueOfType<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >
        beforeEach(function () {
          integerToStringAdapter.convert.mockReturnValue({
            value: 'x',
            required: true,
            readonly: false,
          })
          originalValue = 5
          model = new FormModel<
            typeof typeDef,
            ValueToTypePathsOfType<typeof typeDef>,
            typeof adapters
          >(
            typeDef,
            originalValue,
            adapters,
          )
        })

        it('reports required status', function () {
          expect(model.fields).toEqual(
            expect.objectContaining({
              $: expect.objectContaining({
                value: 'x',
                required: true,
              }),
            }),
          )
        })
      })
    })

    describe('list', function () {
      const typeDef = list(numberType)
      const adapters = {
        '$.*': integerToStringAdapter,
      } as const
      let value: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof adapters
      >
      beforeEach(function () {
        value = [
          1,
          4,
          17,
        ]
        model = new FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >(
          typeDef,
          value,
          adapters,
        )
      })

      describe('accessors', function () {
        it.each([
          [
            '$.0',
            1,
          ],
          [
            '$.1',
            4,
          ],
          [
            '$.2',
            17,
          ],
        ] as const)('gets the expected values for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$.0'])
          accessor.set(100)
          expect(model.value).toEqual([
            100,
            4,
            17,
          ])
        })
      })

      describe('fields', function () {
        it('equals the expected value', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$.0': expect.objectContaining({
              value: '1',
              required: false,
            }),
            '$.1': expect.objectContaining({
              value: '4',
              required: false,
            }),
            '$.2': expect.objectContaining({
              value: '17',
              required: false,
            }),
          }))
        })
      })
    })

    describe('record', function () {
      const typeDef = record<typeof numberType, 'a' | 'b'>(numberType)
      const converters = {
        '$.*': integerToStringAdapter,
        // '$.*': booleanToBooleanConverter,
      } as const
      let value: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = {
          a: 1,
          b: 2,
        }
        model = new FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
        )
      })

      describe('accessors', function () {
        it.each([
          [
            '$.a',
            1,
          ],
          [
            '$.b',
            2,
          ],
        ] as const)('gets the expected value for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$.b'])
          const newValue = 100
          accessor.set(newValue)

          expect(model.value.b).toEqual(newValue)
        })
      })

      describe('fields', function () {
        it('equals expected value', function () {
          expect(model.fields).toEqual(
            expect.objectContaining({
              '$.a': expect.objectContaining({
                value: '1',
              }),
              '$.b': expect.objectContaining({
                value: '2',
              }),
            }),
          )
        })
      })
    })

    describe('object', function () {
      const typeDef = object()
        .field('a', numberType)
        .field('b', booleanType)
      const converters = {
        '$.a': integerToStringAdapter,
        '$.b': booleanToBooleanAdapter,
      } as const
      let value: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = {
          a: 1,
          b: true,
        }
        model = new FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
        )
      })

      describe('accessors', function () {
        it.each([
          [
            '$.a',
            1,
          ],
          [
            '$.b',
            true,
          ],
        ] as const)('gets the expected value for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$.b'])
          accessor.set(false)
          expect(model.value.b).toEqual(false)
        })
      })

      describe('fields', function () {
        it('equals expected value', function () {
          expect(model.fields).toEqual(
            expect.objectContaining({
              '$.a': expect.objectContaining({
                value: '1',
              }),
              '$.b': expect.objectContaining({
                value: true,
              }),
            }),
          )
        })
      })
    })

    // TODO union
  })

  describe('FormPresenter', function () {
    describe('literal', function () {
      const typeDef = numberType
      const adapters = {
        $: integerToStringAdapter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof adapters
      >(
        typeDef,
        adapters,
      )
      const originalValue: ValueOfType<typeof typeDef> = 2
      let model: FormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof adapters
      >
      beforeEach(function () {
        model = presenter.createModel(originalValue)
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$'>(model, '$', '1')
          })

          it('does set the underlying value', function () {
            expect(model.value).toEqual(1)
          })

          it('sets the fields', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              $: expect.objectContaining({
                value: '1',
                error: undefined,
              }),
            }))
          })
        })

        describe('failure', function () {
          describe('conversion fails', function () {
            beforeEach(function () {
              presenter.setFieldValueAndValidate<'$'>(model, '$', 'x')
            })

            it('does not set the underlying value', function () {
              expect(model.value).toEqual(originalValue)
            })

            it('sets the error state', function () {
              expect(model.fields).toEqual(expect.objectContaining({
                $: expect.objectContaining({
                  value: 'x',
                  error: IS_NAN_ERROR,
                }),
              }))
            })
          })

          describe('conversion succeeds, but validation fails', function () {
            const newValue = -1
            const errorCode = 65
            beforeEach(function () {
              integerToStringAdapter.revert?.mockReturnValueOnce({
                type: UnreliableFieldConversionType.Failure,
                error: errorCode,
                value: [newValue],
              })
              presenter.setFieldValueAndValidate<'$'>(model, '$', '-1')
            })

            it('does set the underlying value', function () {
              expect(model.value).toEqual(newValue)
            })

            it('does update the field', function () {
              expect(model.fields).toEqual({
                $: expect.objectContaining({
                  value: '-1',
                  error: errorCode,
                  readonly: false,
                }),
              })
            })
          })
        })
      })

      describe.each([
        [
          '1',
          1,
        ],
        [
          'x',
          originalValue,
        ],
      ] as const)('setFieldValue to %s', function (newValue, expectedValue) {
        beforeEach(function () {
          presenter.setFieldValue<'$'>(model, '$', newValue)
        })

        it('does set the underlying value', function () {
          expect(model.value).toEqual(expectedValue)
        })

        it('sets the field value', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            $: expect.objectContaining({
              value: newValue,
              error: undefined,
            }),
          }))
        })
      })
    })

    describe('list', function () {
      const typeDef = list(numberType)
      const converters = {
        '$.*': integerToStringAdapter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        originalValue = [
          1,
          3,
          7,
        ]
        model = presenter.createModel(originalValue)
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$.0'>(model, '$.0', '100')
          })

          it('sets the underlying value', function () {
            expect(model.value).toEqual([
              100,
              3,
              7,
            ])
          })

          it('sets the fields', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              '$.0': expect.objectContaining({
                value: '100',
                error: undefined,
              }),
            }))
          })
        })

        describe('failure', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$.0'>(model, '$.0', 'x')
          })

          it('does not set the underlying value', function () {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the error state', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              '$.0': expect.objectContaining({
                value: 'x',
                error: IS_NAN_ERROR,
              }),
            }))
          })
        })
      })

      describe.each([
        '1',
        'x',
      ])('setFieldValue to %s', function (newValue) {
        beforeEach(function () {
          presenter.setFieldValue(model, '$.0', newValue)
        })

        it('does not set the underlying value', function () {
          expect(model.value).toEqual(originalValue)
        })

        it('sets the field value', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$.0': expect.objectContaining({
              value: newValue,
              error: undefined,
            }),
          }))
        })
      })

      describe('validate', function () {
        beforeEach(function () {
          presenter.setFieldValue(model, '$.0', 'x')
          presenter.setFieldValue(model, '$.1', '2')
          presenter.setFieldValue(model, '$.2', 'z')
          presenter.validateAll(model)
        })

        it('contains errors for all invalid fields', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$.0': expect.objectContaining({
              value: 'x',
              error: IS_NAN_ERROR,
            }),
            '$.1': expect.objectContaining({
              value: '2',
              error: undefined,
            }),
            '$.2': expect.objectContaining({
              value: 'z',
              error: IS_NAN_ERROR,
            }),
          }))
        })

        it('sets the value only for valid fields', function () {
          expect(model.value).toEqual([
            1,
            2,
            7,
          ])
        })
      })

      // no longer passes context, but will pass context eventually again
      describe('passes context', function () {
        let contextCopy: number[]
        beforeEach(function () {
          integerToStringAdapter.revert.mockImplementationOnce(function (_value, _path, context) {
            contextCopy = [...context]
            return {
              type: UnreliableFieldConversionType.Success,
              value: 1,
            }
          })
        })

        it('supplies the full, previous context when converting', function () {
          presenter.setFieldValueAndValidate(model, '$.2', '4')

          expect(integerToStringAdapter.revert).toHaveBeenCalledOnce()
          expect(integerToStringAdapter.revert).toHaveBeenCalledWith(
            '4',
            '$.2',
            // uses the same pointer
            model.value,
          )
        })

        it('supplies the context as it is at the time call', function () {
          expect(contextCopy).toEqual([
            1,
            3,
            7,
          ])
        })
      })

      describe('addListItem', function () {
        describe('adds default to start of the list', function () {
          beforeEach(function () {
            model.errors['$.0'] = 0
            model.errors['$.1'] = 1
            model.errors['$.2'] = 2
            presenter.addListItem(model, '$', null, 0)
          })

          it('adds the list item to the underlying value', function () {
            expect(model.value).toEqual([
              0,
              1,
              3,
              7,
            ])
          })

          it.each([
            [
              '$.0',
              '0',
            ],
            [
              '$.1',
              '1',
            ],
            [
              '$.2',
              '3',
            ],
            [
              '$.3',
              '7',
            ],
          ] as const)('it reports the value of field %s as %s', function (path, fieldValue) {
            expect(model.fields[path]?.value).toBe(fieldValue)
          })

          it.each([
            [
              '$.0',
              undefined,
            ],
            [
              '$.1',
              0,
            ],
            [
              '$.2',
              1,
            ],
            [
              '$.3',
              2,
            ],
          ] as const)('it reports the error of field %s', function (path, error) {
            expect(model.fields[path]?.error).toBe(error)
          })
        })

        describe('add defined value', function () {
          beforeEach(function () {
            presenter.addListItem(model, '$', [5])
          })

          it('adds the expected value at the end', function () {
            expect(model.fields).toEqual(
              expect.objectContaining({
                '$.0': expect.objectContaining({
                  value: '1',
                }),
                '$.1': expect.objectContaining({
                  value: '3',
                }),
                '$.2': expect.objectContaining({
                  value: '7',
                }),
                '$.3': expect.objectContaining({
                  value: '5',
                }),
              }),
            )
          })

          it('updates the underlying value', function () {
            expect(model.value).toEqual([
              1,
              3,
              7,
              5,
            ])
          })
        })
      })

      describe('removeListItem', function () {
        beforeEach(function () {
          model.errors['$.0'] = 0
          model.errors['$.1'] = 1
          model.errors['$.2'] = 2
        })

        describe('remove first item', function () {
          beforeEach(function () {
            presenter.removeListItem(model, '$.0')
          })

          it('updates the underlying value', function () {
            expect(model.value).toEqual([
              3,
              7,
            ])
          })

          it('updates the field values and errors', function () {
            expect(model.fields).toEqual({
              '$.0': expect.objectContaining({
                value: '3',
                error: 1,
              }),
              '$.1': expect.objectContaining({
                value: '7',
                error: 2,
              }),
            })
          })
        })

        describe('remove second item', function () {
          beforeEach(function () {
            presenter.removeListItem(model, '$.1')
          })

          it('updates the underlying value', function () {
            expect(model.value).toEqual([
              1,
              7,
            ])
          })

          it('updates the field values and errors', function () {
            expect(model.fields).toEqual({
              '$.0': expect.objectContaining({
                value: '1',
                error: 0,
              }),
              '$.1': expect.objectContaining({
                value: '7',
                error: 2,
              }),
            })
          })
        })
      })
    })

    // TODO record / object

    describe('union', function () {
      describe('non-discriminated', function () {
        const listOfNumbersTypeDef = list(numberType)
        const type = union()
          .or('null', nullType)
          .or('0', listOfNumbersTypeDef)
        const adapters = {
          $: adapterFromTwoWayConverter(new NullableToBooleanConverter(type, [1], null)),
          '$.*': integerToStringAdapter,
        } as const
        type ValueToTypePaths = ValueToTypePathsOfType<typeof type>
        const presenter = new FormPresenter<
          typeof type,
          ValueToTypePaths,
          typeof adapters
        >(
          type,
          adapters,
        )
        let originalValue: ValueOfType<typeof type>
        let model: FormModel<
          typeof type,
          ValueToTypePaths,
          typeof adapters
        >
        beforeEach(function () {
          originalValue = null
          model = presenter.createModel(originalValue)
        })

        it('has the expected fields', function () {
          expect(model.fields).toEqual({
            $: {
              readonly: false,
              error: undefined,
              value: false,
              required: false,
            },
          })
        })

        describe('setFieldValueAndValidate', function () {
          describe('success', function () {
            beforeEach(function () {
              presenter.setFieldValueAndValidate<'$'>(model, '$', true)
            })

            it('sets the underlying value', function () {
              expect(model.value).toEqual([1])
            })
          })
        })
      })

      describe('discriminated', function () {
        const struct1 = object().field('a', numberType)
        const struct2 = object().field('b', booleanType)
        const type = union('d')
          .or('x', struct1)
          .or('y', struct2)
        type ValueToTypePaths = ValueToTypePathsOfType<typeof type>

        const adapters = {
          $: adapterFromTwoWayConverter(new SelectDiscriminatedUnionConverter(
            type,
            {
              x: {
                d: 'x',
                a: 0,
              },
              y: {
                d: 'y',
                b: false,
              },
            },
            'x',
            true,
          )).narrow,
          '$.x:a': identityAdapter(0).narrow,
          '$.y:b': identityAdapter(false).narrow,
        } as const
        const presenter = new FormPresenter<
          typeof type,
          ValueToTypePaths,
          typeof adapters
        >(
          type,
          adapters,
        )

        describe('isValuePathActive', function () {
          describe('discriminator x', function () {
            const model = presenter.createModel({
              d: 'x',
              a: 1,
            })
            it.each([
              [
                '$',
                true,
              ],
              [
                '$.x:a',
                true,
              ],
              [
                '$.y:b',
                false,
              ],
            ] as const)('value path %s is active %s', function (path, expected) {
              const isValid = presenter.isValuePathActive(model, path)
              expect(isValid).toBe(expected)
            })
          })

          describe('discriminator y', function () {
            const model = presenter.createModel({
              d: 'y',
              b: false,
            })
            it.each([
              [
                '$',
                true,
              ],
              [
                '$.x:a',
                false,
              ],
              [
                '$.y:b',
                true,
              ],
            ] as const)('value path %s is active %s', function (path, expected) {
              const isValid = presenter.isValuePathActive(model, path)
              expect(isValid).toBe(expected)
            })
          })
        })
      })
    })

    describe('fake', function () {
      const typeDef = numberType
      const converters = {
        $: integerToStringAdapter,
        '$.fake': booleanToBooleanAdapter,
      } as const
      type JsonPaths = {
        $: '$',
        '$.fake': '$.fake',
      }
      const presenter = new FormPresenter<
        typeof typeDef,
        JsonPaths,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        JsonPaths,
        typeof converters
      >
      beforeEach(function () {
        originalValue = 1
        model = presenter.createModel(originalValue)
      })

      it('returns the default value for the fake field', function () {
        expect(model.fields['$.fake']).toEqual(expect.objectContaining({
          value: false,
        }))
      })

      describe('setting fake field', function () {
        beforeEach(function () {
          presenter.setFieldValue(model, '$.fake', true)
        })

        it('stores the new value', function () {
          expect(model.fields['$.fake']).toEqual(expect.objectContaining({
            value: true,
          }))
        })

        it('does not change the original value', function () {
          expect(model.value).toBe(originalValue)
        })
      })
    })
  })
})
