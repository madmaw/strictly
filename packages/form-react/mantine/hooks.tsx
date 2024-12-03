import {
  Cache,
} from '@de/base/util/cache'
import {
  Checkbox,
  type CheckboxProps,
  Radio,
  type RadioGroupProps,
  type RadioProps,
  TextInput,
  type TextInputProps,
} from '@mantine/core'
import { type FormProps } from 'core/props'
import {
  observable,
  runInAction,
} from 'mobx'
import {
  type ComponentType,
  useEffect,
  useMemo,
} from 'react'
import {
  type BooleanFieldsOfFields,
  type ErrorTypeOfField,
  type Field,
  type Fields,
  type StringFieldsOfFields,
  type ValueTypeOfField,
} from 'types/field'
import {
  createPartialObserverComponent,
} from 'util/partial'

export type ErrorRendererProps<E> = {
  error: E,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorRenderer<E = any> = React.ComponentType<ErrorRendererProps<E>>

function DefaultErrorRenderer({
  error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: ErrorRendererProps<any>) {
  return error
}

export function useMantineForm<
  F extends Fields,
>({
  onFieldValueChange,
  onFieldBlur,
  onFieldFocus,
  onFieldSubmit,
  fields,
}: FormProps<F>): MantineForm<F> {
  const form = useMemo(
    function () {
      return new MantineForm<F>(fields)
    },
    // handled separately below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  useEffect(function () {
    runInAction(function () {
      form.fields = fields
    })
  }, [
    form,
    fields,
  ])
  useEffect(function () {
    form.onFieldValueChange = onFieldValueChange
  }, [
    form,
    onFieldValueChange,
  ])
  useEffect(function () {
    form.onFieldBlur = onFieldBlur
  }, [
    form,
    onFieldBlur,
  ])
  useEffect(function () {
    form.onFieldFocus = onFieldFocus
  }, [
    form,
    onFieldFocus,
  ])
  useEffect(function () {
    form.onFieldSubmit = onFieldSubmit
  }, [
    form,
    onFieldSubmit,
  ])
  return form
}

type MantineField<T> = {
  readonly propSource: () => Partial<T>,
  readonly Component: Exclude<ComponentType<T>, never>,
}

class MantineForm<
  F extends Fields,
> {
  private readonly textInputCache: Cache<
    [keyof StringFieldsOfFields<F>, ErrorRenderer],
    MantineField<TextInputProps>
  > = new Cache(
    this.createTextInput.bind(this),
  )
  private readonly checkboxCache: Cache<
    [keyof BooleanFieldsOfFields<F>, ErrorRenderer],
    MantineField<CheckboxProps>
  > = new Cache(
    this.createCheckbox.bind(this),
  )
  private readonly radioGroupCache: Cache<
    [keyof StringFieldsOfFields<F>, ErrorRenderer],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MantineRadioGroup<Field<any, string>>
  > = new Cache(
    this.createRadioGroup.bind(this),
  )

  @observable.ref
  accessor fields: F
  onFieldValueChange: (<K extends keyof F>(this: void, key: K, value: F[K]['value']) => void) | undefined
  onFieldFocus: ((this: void, key: keyof F) => void) | undefined
  onFieldBlur: ((this: void, key: keyof F) => void) | undefined
  onFieldSubmit: ((this: void, key: keyof F) => boolean | void) | undefined

  constructor(fields: F) {
    this.fields = fields
  }

  private createTextInput<K extends keyof StringFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>>,
  ): MantineField<TextInputProps> {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.onFieldValueChange?.(valuePath, e.target.value)
    }
    const onFocus = () => {
      this.onFieldFocus?.(valuePath)
    }
    const onBlur = () => {
      this.onFieldBlur?.(valuePath)
    }
    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (this.onFieldSubmit?.(valuePath)) {
          e.preventDefault()
        }
      }
    }

    const propSource = () => {
      const {
        disabled,
        required,
        value,
        error,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      } = this.fields[valuePath as string]
      return {
        name: valuePath,
        value,
        disabled,
        required,
        error: error && <ErrorRenderer error={error} />,
        onChange,
        onFocus,
        onBlur,
        onKeyUp,
      }
    }
    const Component = createPartialObserverComponent(TextInput, propSource)
    return {
      propSource,
      Component,
    }
  }

  textInput<K extends keyof StringFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ): MantineField<TextInputProps> {
    return this.textInputCache.retrieveOrCreate(valuePath, ErrorRenderer)
  }

  textInputComponent<K extends keyof StringFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ) {
    return this.textInput(valuePath, ErrorRenderer).Component
  }

  private createCheckbox<K extends keyof BooleanFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>>,
  ): MantineField<CheckboxProps> {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.onFieldValueChange?.(valuePath, e.target.checked)
    }
    const onFocus = () => {
      this.onFieldFocus?.(valuePath)
    }
    const onBlur = () => {
      this.onFieldBlur?.(valuePath)
    }
    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (this.onFieldSubmit?.(valuePath)) {
          e.preventDefault()
        }
      }
    }

    const propSource = () => {
      const {
        disabled,
        required,
        value,
        error,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      } = this.fields[valuePath as string]
      return {
        name: valuePath,
        checked: value,
        disabled,
        required,
        error: error && <ErrorRenderer error={error} />,
        onChange,
        onFocus,
        onBlur,
        onKeyUp,
      }
    }
    const Component = createPartialObserverComponent(Checkbox, propSource)
    return {
      propSource,
      Component,
    }
  }

  checkbox<K extends keyof BooleanFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ): MantineField<CheckboxProps> {
    return this.checkboxCache.retrieveOrCreate(valuePath, ErrorRenderer)
  }

  checkboxComponent<K extends keyof BooleanFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ) {
    return this.checkbox(valuePath, ErrorRenderer).Component
  }

  private createRadioGroup<K extends keyof StringFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>>,
  ): MantineRadioGroup<F[K]> {
    const onChange = (value: string) => {
      this.onFieldValueChange?.(valuePath, value)
    }
    const onFocus = () => {
      this.onFieldFocus?.(valuePath)
    }
    const onBlur = () => {
      this.onFieldBlur?.(valuePath)
    }
    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (this.onFieldSubmit?.(valuePath)) {
          e.preventDefault()
        }
      }
    }

    const propSource = () => {
      const {
        required,
        value,
        error,
      } = this.fields[valuePath]

      return {
        name: valuePath,
        value,
        required,
        error: error && <ErrorRenderer error={error} />,
        onChange,
        onFocus,
        onBlur,
        onKeyUp,
      }
    }

    const Component = createPartialObserverComponent(Radio.Group, propSource)
    return new MantineRadioGroup<F[K]>(
      propSource,
      Component,
      () => {
        return this.fields[valuePath]
      },
    )
  }

  radioGroup<K extends keyof StringFieldsOfFields<F>>(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ) {
    return this.radioGroupCache.retrieveOrCreate(valuePath, ErrorRenderer)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class MantineRadioGroup<F extends Field<any, string>> implements MantineField<RadioGroupProps> {
  private readonly radioCache = new Cache(this.createRadio.bind(this))

  constructor(
    readonly propSource: () => Partial<RadioGroupProps>,
    readonly Component: ComponentType<RadioGroupProps>,
    readonly fieldAccessor: () => F,
  ) {
    this.radioCache = new Cache(this.createRadio.bind(this))
  }

  private createRadio(value: ValueTypeOfField<F>) {
    const propSource = () => {
      return {
        disabled: this.fieldAccessor().disabled,
        value,
      }
    }
    const Component = createPartialObserverComponent(
      Radio,
      propSource,
    )
    return {
      propSource,
      Component,
    }
  }

  radio(value: ValueTypeOfField<F>): MantineField<RadioProps> {
    return this.radioCache.retrieveOrCreate(value)
  }

  radioComponent(value: ValueTypeOfField<F>) {
    return this.radio(value).Component
  }
}
