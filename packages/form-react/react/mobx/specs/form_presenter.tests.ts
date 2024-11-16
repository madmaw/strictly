import {
  boolean,
  type FlattenedJsonValueToTypePathsOf,
  list,
  map,
  number,
  struct,
  type ValueTypeOf,
} from '@de/fine'
import { PassThroughConverter } from 'react/mobx/converters/pass_through_converter'
import { StringToIntegerConverter } from 'react/mobx/converters/string_to_integer_converter'
import {
  FormModel,
  FormPresenter,
  type ValuePathsToConvertersOf,
} from 'react/mobx/form_presenter'

const IS_NAN_ERROR = 'isNan'

describe('ValuePathsToConvertersOf', function () {
  describe('superset', function () {
    const converters = {
      '$.x': new StringToIntegerConverter<string>(IS_NAN_ERROR),
      '$.y': new PassThroughConverter<string, boolean>(),
    } as const
    const jsonPaths = {
      $: '$',
      '$.a': '$.x',
      '$.b': '$.y',
      '$.c': '$.z',
    } as const
    type T = ValuePathsToConvertersOf<
      string,
      typeof jsonPaths,
      typeof converters
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
      $: new StringToIntegerConverter<string>(IS_NAN_ERROR),
    } as const
    let value: ValueTypeOf<typeof typeDef>
    let model: FormModel<
      typeof typeDef,
      string,
      FlattenedJsonValueToTypePathsOf<typeof typeDef>,
      typeof converters,
      typeof converters
    >
    beforeEach(function () {
      value = 5
      model = new FormModel<
        typeof typeDef,
        string,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters,
        typeof converters
      >(
        typeDef,
        value,
        converters,
      )
    })

    describe('accessors', function () {
      it('gets the expected value', function () {
        expect(model.accessors.$.value).toEqual(value)
      })

      it('sets a value', function () {
        model.accessors.$.set(1)
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
      typeof converters,
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
        typeof converters,
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
        expect(model.accessors[valuePath].value).toEqual(value)
      })

      it('sets a value', function () {
        model.accessors['$[0]'].set(100)
        expect(model.value).toEqual([
          100,
          4,
          17,
        ])
      })
    })
  })

  describe('map', function () {
    const typeDef = map<'a' | 'b', typeof number>(number)
    const converters = {
      '$.*': new StringToIntegerConverter<string>(IS_NAN_ERROR),
    } as const
    let value: ValueTypeOf<typeof typeDef>
    let model: FormModel<
      typeof typeDef,
      string,
      FlattenedJsonValueToTypePathsOf<typeof typeDef>,
      typeof converters,
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
        typeof converters,
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
        expect(model.accessors[valuePath].value).toEqual(value)
      })

      it('sets a value', function () {
        const newValue = 100
        model.accessors['$.b'].set(newValue)

        expect(value.b).toEqual(newValue)
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
      '$.a': new StringToIntegerConverter<string>(IS_NAN_ERROR),
      '$.b': new PassThroughConverter<string, boolean>(),
    } as const
    let value: ValueTypeOf<typeof typeDef>
    let model: FormModel<
      typeof typeDef,
      string,
      FlattenedJsonValueToTypePathsOf<typeof typeDef>,
      typeof converters,
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
        typeof converters,
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
        expect(model.accessors[valuePath].value).toEqual(value)
      })

      it('sets a value', function () {
        model.accessors['$.b'].set(false)
        expect(value.b).toEqual(false)
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
})

describe('FormPresenter', function () {
  describe('literal', function () {
    const typeDef = number
    const converters = {
      $: new StringToIntegerConverter<string>(IS_NAN_ERROR),
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
      '$.*': new StringToIntegerConverter<string>(IS_NAN_ERROR),
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
  })
})
