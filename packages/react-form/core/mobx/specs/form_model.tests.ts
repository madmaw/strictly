import { expectDefinedAndReturn } from '@strictly/base'
import {
  booleanType,
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingType,
  list,
  nullType,
  numberType,
  object,
  record,
  stringType,
  type Type,
  union,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/define'
import {
  type FieldAdapter,
  type ToOfFieldAdapter,
} from 'core/mobx/field_adapter'
import {
  adapterFromTwoWayConverter,
  identityAdapter,
} from 'core/mobx/field_adapter_builder'
import {
  type FlattenedTypePathsToAdaptersOf,
  FormModel,
  Validation,
  type ValuePathsToAdaptersOf,
} from 'core/mobx/form_model'
import { mergeAdaptersWithValidators } from 'core/mobx/merge_field_adapters_with_validators'
import { IntegerToStringConverter } from 'field_converters/integer_to_string_converter'
import { NullableToBooleanConverter } from 'field_converters/nullable_to_boolean_converter'
import { SelectDiscriminatedUnionConverter } from 'field_converters/select_value_type_converter'
import { prototypingFieldValueFactory } from 'field_value_factories/prototyping_field_value_factory'
import {
  type Simplify,
} from 'type-fest'
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
  new IntegerToStringConverter<typeof IS_NAN_ERROR, string, unknown>(IS_NAN_ERROR),
  prototypingFieldValueFactory(0),
)

const originalBooleanToBooleanAdapter = identityAdapter(false)

class TestFormModel<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<
    FlattenedValuesOfType<T, '*'>,
    {}
  >,
> extends FormModel<T, ValueToTypePaths, TypePathsToAdapters, {}> {
  override toContext(
    value: ValueOfType<T>,
    valuePath: keyof ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths>,
  ) {
    return {
      value,
      valuePath,
    }
  }

  setFieldValueAndValidate<K extends keyof ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths>>(
    valuePath: K,
    value: ToOfFieldAdapter<ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths>[K]>,
  ) {
    this.setFieldValue(valuePath, value, Validation.Always)
  }
}

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
          model = new TestFormModel<
            typeof typeDef,
            ValueToTypePathsOfType<typeof typeDef>,
            typeof adapters
          >(
            typeDef,
            originalValue,
            adapters,
            'create',
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
          model = new TestFormModel<
            typeof typeDef,
            ValueToTypePathsOfType<typeof typeDef>,
            typeof adapters
          >(
            typeDef,
            originalValue,
            adapters,
            'create',
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
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >(
          typeDef,
          value,
          adapters,
          'create',
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
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
          'create',
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
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
          'create',
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

  describe('FormModel', function () {
    describe('literal', function () {
      const typeDef = numberType
      const adapters = {
        $: integerToStringAdapter,
      } as const
      const originalValue: ValueOfType<typeof typeDef> = 2
      let model: TestFormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof adapters
      >
      beforeEach(function () {
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >(
          typeDef,
          originalValue,
          adapters,
          'create',
        )
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            model.setFieldValueAndValidate<'$'>('$', '1')
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
              model.setFieldValueAndValidate<'$'>('$', 'x')
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
            const errorCode = IS_NAN_ERROR
            beforeEach(function () {
              integerToStringAdapter.revert?.mockReturnValue({
                type: UnreliableFieldConversionType.Failure,
                error: errorCode,
                value: [newValue],
              })
              model.setFieldValueAndValidate<'$'>('$', '-1')
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
          model.setFieldValue<'$'>('$', newValue)
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
      let originalValue: ValueOfType<typeof typeDef>
      let model: TestFormModel<
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
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          originalValue,
          converters,
          'create',
        )
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            model.setFieldValueAndValidate<'$.0'>('$.0', '100')
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
            model.setFieldValueAndValidate<'$.0'>('$.0', 'x')
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
          model.setFieldValue('$.0', newValue)
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
          model.setFieldValue('$.0', 'x')
          model.setFieldValue('$.1', '2')
          model.setFieldValue('$.2', 'z')
          model.validateAll()
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
        let contextCopy: string
        beforeEach(function () {
          integerToStringAdapter.revert.mockImplementationOnce(function (_value, _path, context) {
            contextCopy = JSON.stringify(context)
            return {
              type: UnreliableFieldConversionType.Success,
              value: 1,
            }
          })
        })

        it('supplies the context when converting', function () {
          model.setFieldValueAndValidate('$.2', '4')

          expect(integerToStringAdapter.revert).toHaveBeenCalledOnce()
          expect(integerToStringAdapter.revert).toHaveBeenCalledWith(
            '4',
            '$.2',
            {
              // the supplied value isn't a copy, so it will be the model value, even
              // if the value has since changed
              value: model.value,
              valuePath: '$.2',
            },
          )
        })

        it('supplies the correct context value at the time it is being checked', function () {
          // the copy will show the supplied value however
          expect(JSON.parse(contextCopy)).toEqual({
            value: [
              1,
              3,
              7,
            ],
            valuePath: '$.2',
          })
        })
      })

      describe('addListItem', function () {
        describe('adds default to start of the list', function () {
          beforeEach(function () {
            model.setFieldValue('$.0', 'x')
            model.setFieldValue('$.1', '3')
            model.setFieldValue('$.2', 'z')
            model.validateAll()

            model.addListItem('$', null, 0)
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
              'x',
            ],
            [
              '$.2',
              '3',
            ],
            [
              '$.3',
              'z',
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
              IS_NAN_ERROR,
            ],
            [
              '$.2',
              undefined,
            ],
            [
              '$.3',
              IS_NAN_ERROR,
            ],
          ] as const)('it reports the error of field %s', function (path, error) {
            expect(model.fields[path]?.error).toBe(error)
          })
        })

        describe('add defined value', function () {
          beforeEach(function () {
            model.addListItem('$', [5])
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
          model.setFieldValue('$.0', 'x')
          model.setFieldValue('$.1', '3')
          model.setFieldValue('$.2', 'z')
          model.validateAll()
        })

        describe('remove first item', function () {
          beforeEach(function () {
            model.removeListItem('$.0')
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
                error: undefined,
              }),
              '$.1': expect.objectContaining({
                value: 'z',
                error: IS_NAN_ERROR,
              }),
            })
          })
        })

        describe('remove second item', function () {
          beforeEach(function () {
            model.removeListItem('$.1')
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
                value: 'x',
                error: IS_NAN_ERROR,
              }),
              '$.1': expect.objectContaining({
                value: 'z',
                error: IS_NAN_ERROR,
              }),
            })
          })
        })

        describe('remove two items', function () {
          beforeEach(function () {
            model.removeListItem('$.0', '$.1')
          })

          it('updates the underlying value', function () {
            expect(model.value).toEqual([7])
          })

          it('updates the field values and errors', function () {
            expect(model.fields).toEqual({
              '$.0': expect.objectContaining({
                value: 'z',
                error: IS_NAN_ERROR,
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
        let originalValue: ValueOfType<typeof type>
        let model: TestFormModel<
          typeof type,
          ValueToTypePaths,
          typeof adapters
        >
        beforeEach(function () {
          originalValue = null
          model = new TestFormModel<
            typeof type,
            ValueToTypePaths,
            typeof adapters
          >(
            type,
            originalValue,
            adapters,
            'create',
          )
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
              model.setFieldValueAndValidate<'$'>('$', true)
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

        describe('isValuePathActive', function () {
          describe('discriminator x', function () {
            const model = new TestFormModel<
              typeof type,
              ValueToTypePaths,
              typeof adapters
            >(
              type,
              {
                d: 'x',
                a: 1,
              },
              adapters,
              'create',
            )
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
              const isValid = model.isValuePathActive(path)
              expect(isValid).toBe(expected)
            })
          })

          describe('discriminator y', function () {
            const model = new TestFormModel<
              typeof type,
              ValueToTypePaths,
              typeof adapters
            >(
              type,
              {
                d: 'y',
                b: false,
              },
              adapters,
              'create',
            )
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
              const isValid = model.isValuePathActive(path)
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
      let originalValue: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        JsonPaths,
        typeof converters
      >
      beforeEach(function () {
        originalValue = 1
        model = new TestFormModel<
          typeof typeDef,
          JsonPaths,
          typeof converters
        >(
          typeDef,
          originalValue,
          converters,
          'create',
        )
      })

      it('returns the default value for the fake field', function () {
        expect(model.fields['$.fake']).toEqual(expect.objectContaining({
          value: false,
        }))
      })

      describe('setting fake field', function () {
        beforeEach(function () {
          model.setFieldValue('$.fake', true)
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

    describe('interaction with create and edit modes', () => {
      const typeDef = object().readonlyField('n', numberType.enforce(n => n < 10 ? 'err' : null))
      const adapters = mergeAdaptersWithValidators(
        {
          $: identityAdapter({ n: 0 }),
          '$.n': integerToStringAdapter,
        } as const,
        flattenValidatorsOfValidatingType(typeDef),
      )
      type JsonPaths = {
        $: '$',
        '$.n': '$.n',
      }
      let originalValue: ValueOfType<typeof typeDef>
      beforeEach(() => {
        originalValue = {
          n: 1,
        }
      })
      describe('create mode', () => {
        let model: TestFormModel<
          typeof typeDef,
          JsonPaths,
          typeof adapters
        >
        beforeEach(() => {
          model = new TestFormModel<
            typeof typeDef,
            JsonPaths,
            typeof adapters
          >(
            typeDef,
            originalValue,
            adapters,
            'create',
          )
        })

        it('makes the field editable', () => {
          expect(model.fields['$.n'].readonly).toBeFalsy()
        })

        it('fails validation', () => {
          expect(model.validateAll()).toBeFalsy()
        })

        it('passes validation with valid data', () => {
          model.setFieldValue('$.n', '10')
          expect(model.validateAll()).toBeTruthy()
        })
      })
      describe('edit model', () => {
        let model: FormModel<
          typeof typeDef,
          JsonPaths,
          typeof adapters
        >
        beforeEach(function () {
          model = new TestFormModel<
            typeof typeDef,
            JsonPaths,
            typeof adapters
          >(
            typeDef,
            originalValue,
            adapters,
            'edit',
          )
        })

        it('respects the field being readonly', () => {
          expect(model.fields['$.n'].readonly).toBeTruthy()
        })

        it('validates successfully with clean, but invalid data', () => {
          expect(model.validateAll()).toBeTruthy()
        })

        it('fails validation with invalid, dirty data', () => {
          model.setFieldValue('$.n', '2')
          expect(model.validateAll()).toBeFalsy()
        })

        it('passes validation with valid, dirty data', () => {
          model.setFieldValue('$.n', '10')
          expect(model.validateAll()).toBeTruthy()
        })
      })
    })
  })
})
