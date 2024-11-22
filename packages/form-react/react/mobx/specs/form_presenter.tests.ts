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
import { NullableToBooleanConverter } from 'react/mobx/converters/nullable_to_boolean_converter'
import { PassThroughConverter } from 'react/mobx/converters/pass_through_converter'
import { StringToIntegerConverter } from 'react/mobx/converters/string_to_integer_converter'
import {
  type Converter,
  type FlattenedTypePathsToConvertersOf,
  FormModel,
  FormPresenter,
  type ValuePathsToConvertersOf,
} from 'react/mobx/form_presenter'
import { type FormField } from 'types/form_field'
import { type Mocked } from 'vitest'
import {
  mock,
  mockClear,
} from 'vitest-mock-extended'

const IS_NAN_ERROR = 'isNan'

function createMockedConverter<
  To,
  From,
>(impl: Converter<string, Record<string, FormField>, To, From>): Mocked<
  Converter<string, Record<string, FormField>, To, From>
> {
  const mockedConverter = mock<Converter<string, Record<string, FormField>, To, From>>()
  // TODO surely there's a better way of providing fallbacks?
  mockedConverter.convert.mockImplementation(impl.convert.bind(impl))
  mockedConverter.revert.mockImplementation(impl.revert.bind(impl))
  return mockedConverter
}

describe('all', function () {
  const stringToIntegerConverter = createMockedConverter(new StringToIntegerConverter(IS_NAN_ERROR))
  const booleanToBooleanConverter = createMockedConverter(new PassThroughConverter<string, boolean>())

  beforeEach(function () {
    mockClear(stringToIntegerConverter)
    mockClear(booleanToBooleanConverter)
  })

  describe('FlattenedTypePathsToConvertersOf', function () {
    describe('map', function () {
      const typeDef = map<typeof number, 'a' | 'b'>(number)
      type T = FlattenedTypePathsToConvertersOf<
        string,
        FlattenedValueTypesOf<typeof typeDef>
      >
      let t: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly $?: Converter<string, Record<string, FormField>, Record<'a' | 'b', number>, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.a']?: Converter<string, Record<string, FormField>, number, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.b']?: Converter<string, Record<string, FormField>, number, any>,
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('struct', function () {
      const typeDef = struct()
        .set('x', string)
        .set('y', boolean)
      type T = FlattenedTypePathsToConvertersOf<
        string,
        FlattenedValueTypesOf<typeof typeDef>
      >
      let t: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly $?: Converter<string, Record<string, FormField>, { x: string, y: boolean }, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.x']?: Converter<string, Record<string, FormField>, string, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.y']?: Converter<string, Record<string, FormField>, boolean, any>,
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })

      it('matches representative converters', function () {
        const converters = {
          '$.x': new PassThroughConverter<string, string>(),
          '$.y': new PassThroughConverter<string, boolean>(),
        } as const
        expectTypeOf(converters).toMatchTypeOf<T>()
      })

      it('does not allow mismatched converters', function () {
        const converters = {
          '$.x': new PassThroughConverter<string, boolean>(),
          '$.y': new PassThroughConverter<string, string>(),
        } as const
        expectTypeOf(converters).not.toMatchTypeOf<T>()
      })
    })
  })

  describe('ValuePathsToConvertersOf', function () {
    describe('superset', function () {
      const converters = {
        '$.x': stringToIntegerConverter,
        '$.y': booleanToBooleanConverter,
      } as const
      const jsonPaths = {
        $: '$',
        '$.a': '$.x',
        '$.b': '$.y',
        '$.c': '$.z',
      } as const
      type T = ValuePathsToConvertersOf<
        string,
        typeof converters,
        typeof jsonPaths
      >
      let t: {
        readonly '$.a': typeof converters['$.x'],
        readonly '$.b': typeof converters['$.y'],
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('FormModel', function () {
    describe('literal', function () {
      const typeDef = number
      const converters = {
        $: stringToIntegerConverter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        string,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = 5
        model = new FormModel<
          typeof typeDef,
          string,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
        )
      })

      describe('accessors', function () {
        it('gets the expected value', function () {
          const accessor = expectDefinedAndReturn(model.accessors.$)
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors.$)
          accessor.set(1)
          expect(model.value).toEqual(1)
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
      })

      describe('jsonPaths', function () {
        it('equals expected value', function () {
          expect(model.jsonPaths).toEqual({
            $: '$',
          })
        })
      })
    })

    describe('list', function () {
      const typeDef = list(number)
      const converters = {
        '$.*': new StringToIntegerConverter<string>(IS_NAN_ERROR),
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        string,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = [
          1,
          4,
          17,
        ]
        model = new FormModel<
          typeof typeDef,
          string,
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
            '$[0]',
            1,
          ],
          [
            '$[1]',
            4,
          ],
          [
            '$[2]',
            17,
          ],
        ] as const)('gets the expected values for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$[0]'])
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
        '$.*': stringToIntegerConverter,
        // '$.*': booleanToBooleanConverter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        string,
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
          string,
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

      describe('jsonPaths', function () {
        it('equals expected value', function () {
          expect(model.jsonPaths).toEqual({
            $: '$',
            '$.a': '$.*',
            '$.b': '$.*',
          })
        })
      })
    })

    describe('struct', function () {
      const typeDef = struct()
        .set('a', number)
        .set('b', boolean)
      const converters = {
        '$.a': stringToIntegerConverter,
        '$.b': booleanToBooleanConverter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        string,
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
          string,
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

      describe('jsonPaths', function () {
        it('equals expected value', function () {
          expect(model.jsonPaths).toEqual({
            $: '$',
            '$.a': '$.a',
            '$.b': '$.b',
          })
        })
      })
    })

    // TODO union
  })

  describe('FormPresenter', function () {
    describe('literal', function () {
      const typeDef = number
      const converters = {
        $: stringToIntegerConverter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        string,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        string,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        originalValue = 2
        model = presenter.createModel(originalValue)
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$'>(model, '$', '1')
          })

          it('sets the value', function () {
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
      })

      describe.each([
        '1',
        'x',
      ])('setFieldValue to %s', function (newValue) {
        beforeEach(function () {
          presenter.setFieldValue<'$'>(model, '$', newValue)
        })

        it('does not set the underlying value', function () {
          expect(model.value).toEqual(originalValue)
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
        '$.*': stringToIntegerConverter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        string,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        string,
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
            presenter.setFieldValueAndValidate<'$[0]'>(model, '$[0]', '100')
          })

          it('sets the value', function () {
            expect(model.value).toEqual([
              100,
              3,
              7,
            ])
          })

          it('sets the fields', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              '$[0]': expect.objectContaining({
                value: '100',
                // eslint-disable-next-line no-undefined
                error: undefined,
              }),
            }))
          })
        })

        describe('failure', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$[0]'>(model, '$[0]', 'x')
          })

          it('does not set the underlying value', function () {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the error state', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              '$[0]': expect.objectContaining({
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
          presenter.setFieldValue<'$[0]'>(model, '$[0]', newValue)
        })

        it('does not set the underlying value', function () {
          expect(model.value).toEqual(originalValue)
        })

        it('sets the field value', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$[0]': expect.objectContaining({
              value: newValue,
              // eslint-disable-next-line no-undefined
              error: undefined,
            }),
          }))
        })
      })

      describe('validate', function () {
        beforeEach(function () {
          presenter.setFieldValue<'$[0]'>(model, '$[0]', 'x')
          presenter.setFieldValue<'$[1]'>(model, '$[1]', '2')
          presenter.setFieldValue<'$[2]'>(model, '$[2]', 'z')
          presenter.validate(model)
        })

        it('contains errors for all invalid fields', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$[0]': expect.objectContaining({
              value: 'x',
              error: IS_NAN_ERROR,
            }),
            '$[1]': expect.objectContaining({
              value: '2',
              // eslint-disable-next-line no-undefined
              error: undefined,
            }),
            '$[2]': expect.objectContaining({
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

      describe('passes context', function () {
        it('supplies the full, previous context when converting', function () {
          presenter.setFieldValueAndValidate<'$[2]'>(model, '$[2]', '4')

          expect(stringToIntegerConverter.convert).toHaveBeenCalledOnce()
          expect(stringToIntegerConverter.convert).toHaveBeenCalledWith(
            '4',
            '$[2]',
            {
              '$[0]': expect.objectContaining({
                value: '1',
              }),
              '$[1]': expect.objectContaining({
                value: '3',
              }),
              '$[2]': expect.objectContaining({
                value: '7',
              }),
            },
          )
        })
      })
    })

    // TODO map / struct/ union

    describe('union', function () {
      describe('non-discriminated', function () {
        const typeDef = union()
          .add('null', nullTypeDefHolder)
          .add('0', list(number))
        const converters = {
          $: new NullableToBooleanConverter<string, number[]>([1]),
          '$.*': stringToIntegerConverter,
        } as const
        const presenter = new FormPresenter<
          typeof typeDef,
          string,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          converters,
        )
        let originalValue: ValueTypeOf<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          string,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof converters
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
            },
          })
        })

        describe('setFieldValueAndValidate', function () {
          describe('success', function () {
            beforeEach(function () {
              presenter.setFieldValueAndValidate<'$'>(model, '$', true)
            })

            it('sets the value', function () {
              expect(model.value).toEqual([1])
            })
          })
        })
      })
    })
  })
})
