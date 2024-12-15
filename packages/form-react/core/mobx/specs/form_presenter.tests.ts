import { expectDefinedAndReturn } from '@de/base/test'
import {
  boolean,
  type FlattenedJsonValueToTypePathsOf,
  type FlattenedValueTypesOf,
  list,
  map,
  nullTypeDefHolder,
  number,
  string,
  struct,
  union,
  type ValueTypeOf,
} from '@de/fine'
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
import { prototypingFieldValueFactory } from 'field_value_factories/prototyping_field_value_factory'
import { type Simplify } from 'type-fest'
import { type Field } from 'types/field'
import {
  FieldConversionResult,
} from 'types/field_converters'
import { type Mocked } from 'vitest'
import {
  mock,
  mockClear,
} from 'vitest-mock-extended'

const IS_NAN_ERROR = 1

function createMockedAdapter<
  E,
  To,
  From,
  ValuePath extends string,
>({
  convert,
  revert,
  create,
}: FieldAdapter<From, To, E, ValuePath>): Mocked<
  Required<FieldAdapter<From, To, E, ValuePath>>
> {
  const mockedAdapter = mock<Required<FieldAdapter<From, To, E, ValuePath>>>()
  if (revert) {
    mockedAdapter.revert?.mockImplementation(revert)
  }
  mockedAdapter.convert.mockImplementation(convert)
  mockedAdapter.create.mockImplementation(create)

  return mockedAdapter
}

describe('all', function () {
  const integerToStringAdapter = createMockedAdapter(
    adapterFromTwoWayConverter(
      new IntegerToStringConverter(IS_NAN_ERROR),
      prototypingFieldValueFactory(0),
    ),
  )
  const booleanToBooleanAdapter = createMockedAdapter(
    identityAdapter(false),
  )

  beforeEach(function () {
    mockClear(integerToStringAdapter)
    mockClear(booleanToBooleanAdapter)
  })

  describe('FlattenedTypePathsToConvertersOf', function () {
    describe('map', function () {
      const typeDef = map<typeof number, 'a' | 'b'>(number)
      type T = Simplify<
        FlattenedTypePathsToAdaptersOf<
          FlattenedValueTypesOf<typeof typeDef>
        >
      >
      let t: Partial<{
        readonly $: FieldAdapter<Readonly<Record<'a' | 'b', number>>>,
        readonly ['$.a']: FieldAdapter<number>,
        readonly ['$.b']: FieldAdapter<number>,
      }>

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('struct', function () {
      const typeDef = struct()
        .set('x', string)
        .set('y', boolean)
      type T = FlattenedTypePathsToAdaptersOf<
        FlattenedValueTypesOf<typeof typeDef>
      >
      let t: Partial<{
        readonly $: FieldAdapter<{ readonly x: string, readonly y: boolean }>,
        readonly ['$.x']: FieldAdapter<string>,
        readonly ['$.y']: FieldAdapter<boolean>,
      }>
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
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
      let t: {
        readonly '$.a': A['$.x'],
        readonly '$.b': A['$.y'],
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('FormModel', function () {
    describe('literal', function () {
      const typeDef = number
      const adapters = {
        $: integerToStringAdapter,
      } as const
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof adapters
      >
      beforeEach(function () {
        originalValue = 5
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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

    describe('list', function () {
      const typeDef = list(number)
      const adapters = {
        '$.*': integerToStringAdapter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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
    })

    describe('map', function () {
      const typeDef = map<typeof number, 'a' | 'b'>(number)
      const converters = {
        '$.*': integerToStringAdapter,
        // '$.*': booleanToBooleanConverter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = {
          a: 1,
          b: 2,
        }
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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

    describe('struct', function () {
      const typeDef = struct()
        .set('a', number)
        .set('b', boolean)
      const converters = {
        '$.a': integerToStringAdapter,
        '$.b': booleanToBooleanAdapter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = {
          a: 1,
          b: true,
        }
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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
      const typeDef = number
      const adapters = {
        $: integerToStringAdapter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof adapters
      >(
        typeDef,
        adapters,
      )
      const originalValue: ValueTypeOf<typeof typeDef> = 2
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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
                // eslint-disable-next-line no-undefined
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
                type: FieldConversionResult.Failure,
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
                  disabled: false,
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
              // eslint-disable-next-line no-undefined
              error: undefined,
            }),
          }))
        })
      })
    })

    describe('list', function () {
      const typeDef = list(number)
      const converters = {
        '$.*': integerToStringAdapter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
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
                // eslint-disable-next-line no-undefined
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
              // eslint-disable-next-line no-undefined
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
              // eslint-disable-next-line no-undefined
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
      describe.skip('passes context', function () {
        it('supplies the full, previous context when converting', function () {
          presenter.setFieldValueAndValidate(model, '$.2', '4')

          expect(integerToStringAdapter.revert).toHaveBeenCalledOnce()
          expect(integerToStringAdapter.revert).toHaveBeenCalledWith(
            '4',
            '$.2',
            expect.objectContaining({
              '$.2': expect.objectContaining({
                value: '7',
              }),
            }),
          )
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
              // eslint-disable-next-line no-undefined
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
    })

    // TODO map / struct

    describe('union', function () {
      describe('non-discriminated', function () {
        const listOfNumbersTypeDef = list(number)
        const typeDef = union()
          .add('null', nullTypeDefHolder)
          .add('0', listOfNumbersTypeDef)
        const adapters = {
          $: adapterFromTwoWayConverter(new NullableToBooleanConverter(typeDef, [1])),
          '$.*': integerToStringAdapter,
        } as const
        type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>
        const presenter = new FormPresenter<
          typeof typeDef,
          JsonPaths,
          typeof adapters
        >(
          typeDef,
          adapters,
        )
        let originalValue: ValueTypeOf<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          JsonPaths,
          typeof adapters
        >
        beforeEach(function () {
          originalValue = null
          model = presenter.createModel(originalValue)
        })

        it('has the expected fields', function () {
          expect(model.fields).toEqual({
            $: {
              disabled: false,
              // eslint-disable-next-line no-undefined
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
    })

    describe('fake', function () {
      const typeDef = number
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
      let originalValue: ValueTypeOf<typeof typeDef>
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
