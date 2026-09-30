import {
  booleanType,
  type FlattenedValuesOfType,
  flattenValidatorsOfValidatingTypeWithMutability,
  list,
  nullType,
  numberType,
  object,
  type ReadonlyTypeOfType,
  record,
  stringType,
  type Type,
  union,
  type ValueOfType,
  type ValueToTypePathsOfType,
} from '@strictly/base'
import { expectDefinedAndReturn } from '@strictly/vitest'
import {
  type FieldAdapter,
  type ToOfFieldAdapter,
} from 'form/core/mobx/FieldAdapter'
import {
  adapterFromTwoWayConverter,
  identityAdapter,
} from 'form/core/mobx/fieldAdapterBuilder'
import {
  type FlattenedTypePathsToAdaptersOf,
  FormModel,
  type FormModelContextSource,
  Validation,
  type ValuePathsToAdaptersOf,
} from 'form/core/mobx/FormModel'
import { mergeAdaptersWithValidators } from 'form/core/mobx/mergeFieldAdaptersWithValidators'
import { IntegerToStringConverter } from 'form/field-converters/IntegerToStringConverter'
import { NullableToBooleanConverter } from 'form/field-converters/NullableToBooleanConverter'
import { SelectDiscriminatedUnionConverter } from 'form/field-converters/SelectValueTypeConverter'
import { prototypingFieldValueFactory } from 'form/field-value-factories/prototypingFieldValueFactory'
import { type Field } from 'form/types/Field'
import { UnreliableFieldConversionType } from 'form/types/FieldConverters'
import { type Simplify } from 'type-fest'
import { createMockedAdapter, resetMockAdapter } from './fixtures'

const IS_NAN_ERROR = 1

const originalIntegerToStringAdapter = adapterFromTwoWayConverter(
  new IntegerToStringConverter<typeof IS_NAN_ERROR, string, unknown>(
    IS_NAN_ERROR,
  ),
  prototypingFieldValueFactory(0),
)

const originalBooleanToBooleanAdapter = identityAdapter(false)

type TextFormContext = {
  forceMutable: boolean
  value: unknown
  valuePath: unknown
}

class TestFormContextSource<
  V,
  ValuePath extends string | number | symbol,
> implements FormModelContextSource<TextFormContext, V, ValuePath> {
  constructor(private readonly forceMutable: boolean) {}

  forPath(value: V, valuePath: ValuePath): TextFormContext {
    return {
      forceMutable: this.forceMutable,
      value,
      valuePath,
    }
  }
}

class TestFormModel<
  T extends Type,
  ValueToTypePaths extends Readonly<Record<string, string>>,
  TypePathsToAdapters extends FlattenedTypePathsToAdaptersOf<
    FlattenedValuesOfType<ReadonlyTypeOfType<T>, '*'>,
    {}
  >,
> extends FormModel<T, ValueToTypePaths, TypePathsToAdapters, {}> {
  constructor(
    type: T,
    originalValue: ValueOfType<ReadonlyTypeOfType<T>>,
    adapters: TypePathsToAdapters,
    forceMutable = false,
  ) {
    super(
      type,
      originalValue,
      adapters,
      new TestFormContextSource(forceMutable),
    )
  }

  setFieldValueAndValidate<
    K extends keyof ValuePathsToAdaptersOf<
      TypePathsToAdapters,
      ValueToTypePaths
    >,
  >(
    valuePath: K,
    value: ToOfFieldAdapter<
      ValuePathsToAdaptersOf<TypePathsToAdapters, ValueToTypePaths>[K]
    >,
  ) {
    this.setFieldValue(valuePath, value, Validation.Always)
  }
}

describe('all', () => {
  const integerToStringAdapter = createMockedAdapter(
    originalIntegerToStringAdapter,
  )
  const booleanToBooleanAdapter = createMockedAdapter(
    originalBooleanToBooleanAdapter,
  )

  beforeEach(() => {
    resetMockAdapter(originalIntegerToStringAdapter, integerToStringAdapter)
    resetMockAdapter(originalBooleanToBooleanAdapter, booleanToBooleanAdapter)
  })

  describe('FlattenedTypePathsToAdaptersOf', () => {
    type ConvenientFieldAdapter<
      From,
      Context,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      To = any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      E = any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ValuePath extends string = any,
    > = FieldAdapter<From, To, E, ValuePath, Context>

    describe('record', () => {
      const typeDef = record<typeof numberType, 'a' | 'b'>(numberType).narrow
      type T = Simplify<
        FlattenedTypePathsToAdaptersOf<
          FlattenedValuesOfType<ReadonlyTypeOfType<typeof typeDef>>,
          ValueOfType<typeof typeDef>
        >
      >
      type C = Partial<{
        readonly $: ConvenientFieldAdapter<
          Readonly<Record<'a' | 'b', number>>,
          ValueOfType<typeof typeDef>
        >
        readonly ['$.a']: ConvenientFieldAdapter<
          number,
          ValueOfType<typeof typeDef>
        >
        readonly ['$.b']: ConvenientFieldAdapter<
          number,
          ValueOfType<typeof typeDef>
        >
      }>

      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })

    describe('object', () => {
      const typeDef = object()
        .field('x', stringType)
        .field('y', booleanType).narrow
      type T = FlattenedTypePathsToAdaptersOf<
        FlattenedValuesOfType<ReadonlyTypeOfType<typeof typeDef>>,
        ValueOfType<typeof typeDef>
      >
      type C = Partial<{
        readonly $: ConvenientFieldAdapter<
          { readonly x: string; readonly y: boolean },
          ValueOfType<typeof typeDef>
        >
        readonly ['$.x']: ConvenientFieldAdapter<
          string,
          ValueOfType<typeof typeDef>
        >
        readonly ['$.y']: ConvenientFieldAdapter<
          boolean,
          ValueOfType<typeof typeDef>
        >
      }>
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })

      it('matches representative adapters', () => {
        type A = {
          '$.x': FieldAdapter<string, string>
          '$.y': FieldAdapter<boolean, string>
        }
        expectTypeOf<A>().toMatchTypeOf<T>()
      })

      it('does not allow mismatched adapters', () => {
        type A = {
          '$.x': FieldAdapter<boolean, string, Record<string, Field>>
          '$.y': FieldAdapter<string, string, Record<string, Field>>
        }
        expectTypeOf<A>().not.toMatchTypeOf<T>()
      })
    })
  })

  describe('ValuePathsToAdaptersOf', () => {
    describe('superset', () => {
      type A = {
        '$.x': FieldAdapter<number, string, string, '$.a'>
        '$.y': FieldAdapter<boolean, boolean, string, '$.b'>
      }
      const valuePathsToTypePaths = {
        $: '$',
        '$.a': '$.x',
        '$.b': '$.y',
        '$.c': '$.z',
      } as const
      type T = ValuePathsToAdaptersOf<A, typeof valuePathsToTypePaths>
      type C = {
        readonly '$.a': A['$.x']
        readonly '$.b': A['$.y']
      }
      it('equals expected type', () => {
        expectTypeOf<C>().toEqualTypeOf<T>()
      })
    })
  })

  describe('FormModel', () => {
    describe('literal', () => {
      describe('optional', () => {
        const typeDef = numberType.narrow
        const adapters = {
          $: integerToStringAdapter,
        } as const
        let originalValue: ValueOfType<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >
        beforeEach(() => {
          originalValue = 5
          model = new TestFormModel<
            typeof typeDef,
            ValueToTypePathsOfType<typeof typeDef>,
            typeof adapters
          >(typeDef, originalValue, adapters)
        })

        describe('accessors', () => {
          it('gets the expected value', () => {
            const accessor = expectDefinedAndReturn(model.accessors.$)
            expect(accessor.value).toEqual(originalValue)
          })

          it('sets the underlying value', () => {
            const newValue = 1
            const accessor = expectDefinedAndReturn(model.accessors.$)
            accessor.set(newValue)
            expect(model.value).toEqual(newValue)
          })
        })

        describe('fields', () => {
          it('equals expected value', () => {
            expect(model.fields).toEqual(
              expect.objectContaining({
                $: expect.objectContaining({
                  value: '5',
                }),
              }),
            )
          })

          it('has the expected keys', () => {
            expect(Object.keys(model.fields)).toEqual(['$'])
          })
        })
      })

      describe('required', () => {
        const typeDef = numberType.narrow
        const adapters = {
          $: integerToStringAdapter,
        } as const
        let originalValue: ValueOfType<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >
        beforeEach(() => {
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
          >(typeDef, originalValue, adapters)
        })

        it('reports required status', () => {
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

    describe('list', () => {
      const typeDef = list(numberType).narrow
      const adapters = {
        '$.*': integerToStringAdapter,
      } as const
      let value: ValueOfType<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof adapters
      >
      beforeEach(() => {
        value = [1, 4, 17]
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >(typeDef, value, adapters)
      })

      describe('accessors', () => {
        it.each([
          ['$.0', 1],
          ['$.1', 4],
          ['$.2', 17],
        ] as const)('gets the expected values for %s', (valuePath, value) => {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', () => {
          const accessor = expectDefinedAndReturn(model.accessors['$.0'])
          accessor.set(100)
          expect(model.value).toEqual([100, 4, 17])
        })
      })

      describe('fields', () => {
        it('equals the expected value', () => {
          expect(model.fields).toEqual(
            expect.objectContaining({
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
            }),
          )
        })
      })
    })

    describe('record', () => {
      const typeDef = record<typeof numberType, 'a' | 'b'>(numberType).narrow
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
      beforeEach(() => {
        value = {
          a: 1,
          b: 2,
        }
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(typeDef, value, converters)
      })

      describe('accessors', () => {
        it.each([
          ['$.a', 1],
          ['$.b', 2],
        ] as const)('gets the expected value for %s', (valuePath, value) => {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', () => {
          const accessor = expectDefinedAndReturn(model.accessors['$.b'])
          const newValue = 100
          accessor.set(newValue)

          expect(model.value.b).toEqual(newValue)
        })
      })

      describe('fields', () => {
        it('equals expected value', () => {
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

    describe('object', () => {
      const typeDef = object()
        .field('a', numberType)
        .field('b', booleanType).narrow
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
      beforeEach(() => {
        value = {
          a: 1,
          b: true,
        }
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(typeDef, value, converters)
      })

      describe('accessors', () => {
        it.each([
          ['$.a', 1],
          ['$.b', true],
        ] as const)('gets the expected value for %s', (valuePath, value) => {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', () => {
          const accessor = expectDefinedAndReturn(model.accessors['$.b'])
          accessor.set(false)
          expect(model.value.b).toEqual(false)
        })
      })

      describe('fields', () => {
        it('equals expected value', () => {
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

  describe('FormModel', () => {
    describe('literal', () => {
      const typeDef = numberType.narrow
      const adapters = {
        $: integerToStringAdapter,
      } as const
      const originalValue: ValueOfType<typeof typeDef> = 2
      let model: TestFormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof adapters
      >
      beforeEach(() => {
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof adapters
        >(typeDef, originalValue, adapters)
      })

      describe('setFieldValueAndValidate', () => {
        describe('success', () => {
          beforeEach(() => {
            model.setFieldValueAndValidate<'$'>('$', '1')
          })

          it('does set the underlying value', () => {
            expect(model.value).toEqual(1)
          })

          it('sets the fields', () => {
            expect(model.fields).toEqual(
              expect.objectContaining({
                $: expect.objectContaining({
                  value: '1',
                  error: undefined,
                }),
              }),
            )
          })
        })

        describe('failure', () => {
          describe('conversion fails', () => {
            beforeEach(() => {
              model.setFieldValueAndValidate<'$'>('$', 'x')
            })

            it('does not set the underlying value', () => {
              expect(model.value).toEqual(originalValue)
            })

            it('sets the error state', () => {
              expect(model.fields).toEqual(
                expect.objectContaining({
                  $: expect.objectContaining({
                    value: 'x',
                    error: IS_NAN_ERROR,
                  }),
                }),
              )
            })
          })

          describe('conversion succeeds, but validation fails', () => {
            const newValue = -1
            const errorCode = IS_NAN_ERROR
            beforeEach(() => {
              integerToStringAdapter.revert.mockReturnValue({
                type: UnreliableFieldConversionType.Failure,
                error: errorCode,
                value: [newValue],
              })
              model.setFieldValueAndValidate<'$'>('$', '-1')
            })

            it('does set the underlying value', () => {
              expect(model.value).toEqual(newValue)
            })

            it('does update the field', () => {
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
        ['1', 1],
        ['x', originalValue],
      ] as const)('setFieldValue to %s', (newValue, expectedValue) => {
        beforeEach(() => {
          model.setFieldValue<'$'>('$', newValue)
        })

        it('does set the underlying value', () => {
          expect(model.value).toEqual(expectedValue)
        })

        it('sets the field value', () => {
          expect(model.fields).toEqual(
            expect.objectContaining({
              $: expect.objectContaining({
                value: newValue,
                error: undefined,
              }),
            }),
          )
        })
      })
    })

    describe('list', () => {
      const typeDef = list(numberType).narrow
      const converters = {
        '$.*': integerToStringAdapter,
      } as const
      let originalValue: ValueOfType<typeof typeDef>
      let model: TestFormModel<
        typeof typeDef,
        ValueToTypePathsOfType<typeof typeDef>,
        typeof converters
      >
      beforeEach(() => {
        originalValue = [1, 3, 7]
        model = new TestFormModel<
          typeof typeDef,
          ValueToTypePathsOfType<typeof typeDef>,
          typeof converters
        >(typeDef, originalValue, converters)
      })

      describe('setFieldValueAndValidate', () => {
        describe('success', () => {
          beforeEach(() => {
            model.setFieldValueAndValidate<'$.0'>('$.0', '100')
          })

          it('sets the underlying value', () => {
            expect(model.value).toEqual([100, 3, 7])
          })

          it('sets the fields', () => {
            expect(model.fields).toEqual(
              expect.objectContaining({
                '$.0': expect.objectContaining({
                  value: '100',
                  error: undefined,
                }),
              }),
            )
          })
        })

        describe('failure', () => {
          beforeEach(() => {
            model.setFieldValueAndValidate<'$.0'>('$.0', 'x')
          })

          it('does not set the underlying value', () => {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the error state', () => {
            expect(model.fields).toEqual(
              expect.objectContaining({
                '$.0': expect.objectContaining({
                  value: 'x',
                  error: IS_NAN_ERROR,
                }),
              }),
            )
          })
        })
      })

      describe.each(['1', 'x'])('setFieldValue to %s', (newValue) => {
        beforeEach(() => {
          model.setFieldValue('$.0', newValue)
        })

        it('does not set the underlying value', () => {
          expect(model.value).toEqual(originalValue)
        })

        it('sets the field value', () => {
          expect(model.fields).toEqual(
            expect.objectContaining({
              '$.0': expect.objectContaining({
                value: newValue,
                error: undefined,
              }),
            }),
          )
        })
      })

      describe('validate', () => {
        beforeEach(() => {
          model.setFieldValue('$.0', 'x')
          model.setFieldValue('$.1', '2')
          model.setFieldValue('$.2', 'z')
          model.validateAll()
        })

        it('contains errors for all invalid fields', () => {
          expect(model.fields).toEqual(
            expect.objectContaining({
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
            }),
          )
        })

        it('sets the value only for valid fields', () => {
          expect(model.value).toEqual([1, 2, 7])
        })
      })

      // no longer passes context, but will pass context eventually again
      describe('passes context', () => {
        let contextCopy: string
        beforeEach(() => {
          integerToStringAdapter.revert.mockImplementationOnce(
            (_value, _path, context) => {
              contextCopy = JSON.stringify(context)
              return {
                type: UnreliableFieldConversionType.Success,
                value: 1,
              }
            },
          )
        })

        it('supplies the context when converting', () => {
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
              forceMutable: false,
            },
          )
        })

        it('supplies the correct context value at the time it is being checked', () => {
          // the copy will show the supplied value however
          expect(JSON.parse(contextCopy)).toEqual({
            value: [1, 3, 7],
            valuePath: '$.2',
            forceMutable: false,
          })
        })
      })

      describe('addListItem', () => {
        describe('adds default to start of the list', () => {
          beforeEach(() => {
            model.setFieldValue('$.0', 'x')
            model.setFieldValue('$.1', '3')
            model.setFieldValue('$.2', 'z')
            model.validateAll()

            model.addListItem('$', null, 0)
          })

          it('adds the list item to the underlying value', () => {
            expect(model.value).toEqual([0, 1, 3, 7])
          })

          it.each([
            [
              // new
              '$.3',
              '0',
            ],
            ['$.0', 'x'],
            ['$.1', '3'],
            ['$.2', 'z'],
          ] as const)(
            'it reports the value of field %s as %s',
            (path, fieldValue) => {
              expect(model.fields[path]?.value).toBe(fieldValue)
            },
          )

          it.each([
            [
              // new
              '$.3',
              undefined,
            ],
            ['$.0', IS_NAN_ERROR],
            ['$.1', undefined],
            ['$.2', IS_NAN_ERROR],
          ] as const)('it reports the error of field %s', (path, error) => {
            expect(model.fields[path]?.error).toBe(error)
          })
        })

        describe('add defined value', () => {
          beforeEach(() => {
            model.addListItem('$', [5])
          })

          it('adds the expected value at the end', () => {
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

          it('updates the underlying value', () => {
            expect(model.value).toEqual([1, 3, 7, 5])
          })
        })
      })

      describe('removeListItem', () => {
        beforeEach(() => {
          model.setFieldValue('$.0', 'x')
          model.setFieldValue('$.1', '3')
          model.setFieldValue('$.2', 'z')
          model.validateAll()
        })

        describe('remove first item', () => {
          beforeEach(() => {
            model.removeListItem('$.0')
          })

          it('updates the underlying value', () => {
            expect(model.value).toEqual([3, 7])
          })

          it('updates the field values and errors', () => {
            expect(model.fields).toEqual({
              '$.1': expect.objectContaining({
                value: '3',
                error: undefined,
              }),
              '$.2': expect.objectContaining({
                value: 'z',
                error: IS_NAN_ERROR,
              }),
            })
          })
        })

        describe('remove second item', () => {
          beforeEach(() => {
            model.removeListItem('$.1')
          })

          it('updates the underlying value', () => {
            expect(model.value).toEqual([1, 7])
          })

          it('updates the field values and errors', () => {
            expect(model.fields).toEqual({
              '$.0': expect.objectContaining({
                value: 'x',
                error: IS_NAN_ERROR,
              }),
              '$.2': expect.objectContaining({
                value: 'z',
                error: IS_NAN_ERROR,
              }),
            })
          })
        })

        describe('remove two items', () => {
          beforeEach(() => {
            model.removeListItem('$.0', '$.1')
          })

          it('updates the underlying value', () => {
            expect(model.value).toEqual([7])
          })

          it('updates the field values and errors', () => {
            expect(model.fields).toEqual({
              '$.2': expect.objectContaining({
                value: 'z',
                error: IS_NAN_ERROR,
              }),
            })
          })
        })
      })
    })

    // TODO record / object

    describe('union', () => {
      describe('non-discriminated', () => {
        const listOfNumbersTypeDef = list(numberType)
        const type = union()
          .or('null', nullType)
          .or('0', listOfNumbersTypeDef).narrow
        const adapters = {
          $: adapterFromTwoWayConverter(
            new NullableToBooleanConverter(type, [1], null),
          ),
          '$.*': integerToStringAdapter,
        } as const
        type ValueToTypePaths = ValueToTypePathsOfType<typeof type>
        let originalValue: ValueOfType<typeof type>
        let model: TestFormModel<typeof type, ValueToTypePaths, typeof adapters>
        beforeEach(() => {
          originalValue = null
          model = new TestFormModel<
            typeof type,
            ValueToTypePaths,
            typeof adapters
          >(type, originalValue, adapters)
        })

        it('has the expected fields', () => {
          expect(model.fields).toEqual({
            $: {
              readonly: false,
              error: undefined,
              value: false,
              required: false,
            },
          })
        })

        describe('setFieldValueAndValidate', () => {
          describe('success', () => {
            beforeEach(() => {
              model.setFieldValueAndValidate<'$'>('$', true)
            })

            it('sets the underlying value', () => {
              expect(model.value).toEqual([1])
            })
          })
        })
      })

      describe('discriminated', () => {
        const struct1 = object().field('a', numberType)
        const struct2 = object().field('b', booleanType)
        const type = union('d').or('x', struct1).or('y', struct2).narrow
        type ValueToTypePaths = ValueToTypePathsOfType<typeof type>

        const adapters = {
          $: adapterFromTwoWayConverter(
            new SelectDiscriminatedUnionConverter(
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
            ),
          ).narrow,
          '$:x.a': identityAdapter(0).narrow,
          '$:y.b': identityAdapter(false).narrow,
        } as const

        describe('isValuePathActive', () => {
          describe('discriminator x', () => {
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
            )
            it.each([
              ['$', true],
              ['$:x.a', true],
              ['$:y.b', false],
            ] as const)('value path %s is active %s', (path, expected) => {
              const isValid = model.isValuePathActive(path)
              expect(isValid).toBe(expected)
            })
          })

          describe('discriminator y', () => {
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
            )
            it.each([
              ['$', true],
              ['$:x.a', false],
              ['$:y.b', true],
            ] as const)('value path %s is active %s', (path, expected) => {
              const isValid = model.isValuePathActive(path)
              expect(isValid).toBe(expected)
            })
          })
        })
      })
    })

    describe('fake', () => {
      const typeDef = numberType.narrow
      const converters = {
        $: integerToStringAdapter,
        '$.fake': booleanToBooleanAdapter,
      } as const
      type JsonPaths = {
        $: '$'
        '$.fake': '$.fake'
      }
      let originalValue: ValueOfType<typeof typeDef>
      let model: FormModel<typeof typeDef, JsonPaths, typeof converters>
      beforeEach(() => {
        originalValue = 1
        model = new TestFormModel<typeof typeDef, JsonPaths, typeof converters>(
          typeDef,
          originalValue,
          converters,
        )
      })

      it('returns the default value for the fake field', () => {
        expect(model.fields['$.fake']).toEqual(
          expect.objectContaining({
            value: false,
          }),
        )
      })

      describe('setting fake field', () => {
        beforeEach(() => {
          model.setFieldValue('$.fake', true)
        })

        it('stores the new value', () => {
          expect(model.fields['$.fake']).toEqual(
            expect.objectContaining({
              value: true,
            }),
          )
        })

        it('does not change the original value', () => {
          expect(model.value).toBe(originalValue)
        })
      })
    })

    describe('interaction with mutability', () => {
      const typeDef = object().readonlyField(
        'n',
        numberType.enforce((n) => (n < 10 ? 'err' : null)),
      ).narrow
      const adapters = mergeAdaptersWithValidators(
        {
          $: identityAdapter({ n: 0 }),
          '$.n': integerToStringAdapter,
        } as const,
        flattenValidatorsOfValidatingTypeWithMutability(typeDef),
      )
      type JsonPaths = {
        $: '$'
        '$.n': '$.n'
      }
      let originalValue: ValueOfType<typeof typeDef>
      beforeEach(() => {
        originalValue = {
          n: 1,
        }
      })
      describe('create mode', () => {
        let model: TestFormModel<typeof typeDef, JsonPaths, typeof adapters>
        beforeEach(() => {
          model = new TestFormModel<typeof typeDef, JsonPaths, typeof adapters>(
            typeDef,
            originalValue,
            adapters,
            true,
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
    })
  })
})
