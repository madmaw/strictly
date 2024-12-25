import {
  Cache,
  type ElementOfArray,
} from '@de/base'
import {
  Checkbox as CheckboxImpl,
  type CheckboxProps,
  Pill as PillImpl,
  type PillProps,
  Radio as RadioImpl,
  type RadioGroupProps,
  type RadioProps,
  Select,
  type SelectProps,
  TextInput as TextInputImpl,
  type TextInputProps,
} from '@mantine/core'
import { type FormProps } from 'core/props'
import {
  observable,
  runInAction,
} from 'mobx'
import {
  type ComponentProps,
  type ComponentType,
  type PropsWithChildren,
  useEffect,
  useMemo,
} from 'react'
import { type AllFieldsOfFields } from 'types/all_fields_of_fields'
import { type BooleanFieldsOfFields } from 'types/boolean_fields_of_fields'
import { type ErrorTypeOfField } from 'types/error_type_of_field'
import {
  type Fields,
} from 'types/field'
import { type ListFieldsOfFields } from 'types/list_fields_of_fields'
import { type StringFieldsOfFields } from 'types/string_fields_of_fields'
import { type ValueTypeOfField } from 'types/value_type_of_field'
import {
  createCheckbox,
  type SuppliedCheckboxProps,
} from './create_checkbox'
import {
  createList,
  DefaultList,
  type SuppliedListProps,
} from './create_list'
import {
  createPill,
  type SuppliedPillProps,
} from './create_pill'
import {
  createRadio,
  type SuppliedRadioProps,
} from './create_radio'
import {
  createRadioGroup,
  type SuppliedRadioGroupProps,
} from './create_radio_group'
import {
  createTextInput,
  type SuppliedTextInputProps,
} from './create_text_input'
import {
  createValueInput,
  type SuppliedValueInputProps,
} from './create_value_input'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

function SimpleSelect(props: SelectProps & {
  onChange?: (value: string | null) => void,
}) {
  return <Select {...props} />
}

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
}: FormProps<F>): MantineFormImpl<F> {
  const form = useMemo(
    function () {
      return new MantineFormImpl(fields)
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

class MantineFormImpl<
  F extends Fields,
> implements MantineForm<F> {
  private readonly textInputCache: Cache<
    [keyof StringFieldsOfFields<F>, ComponentType<SuppliedTextInputProps>, ErrorRenderer],
    MantineFieldComponent<SuppliedTextInputProps>
  > = new Cache(
    createTextInput.bind(this),
  )
  private readonly valueInputCache: Cache<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [keyof AllFieldsOfFields<F>, ComponentType<SuppliedValueInputProps<any>>, ErrorRenderer],
    MantineFieldComponent<SuppliedTextInputProps>
  > = new Cache(
    createValueInput.bind(this),
  )

  private readonly checkboxCache: Cache<
    [keyof BooleanFieldsOfFields<F>, ComponentType<SuppliedCheckboxProps>, ErrorRenderer],
    MantineFieldComponent<SuppliedCheckboxProps>
  > = new Cache(
    createCheckbox.bind(this),
  )
  private readonly radioGroupCache: Cache<
    [keyof StringFieldsOfFields<F>, ComponentType<SuppliedRadioGroupProps>, ErrorRenderer],
    MantineFieldComponent<SuppliedRadioGroupProps>
  > = new Cache(
    createRadioGroup.bind(this),
  )
  private readonly radioCache: Cache<
    [keyof StringFieldsOfFields<F>, string, ComponentType<SuppliedRadioProps>],
    MantineFieldComponent<SuppliedRadioProps>
  > = new Cache(
    createRadio.bind(this),
  )
  private readonly pillCache: Cache<
    [keyof AllFieldsOfFields<F>, ComponentType<SuppliedPillProps>],
    MantineFieldComponent<SuppliedPillProps>
  > = new Cache(
    createPill.bind(this),
  )
  private readonly listCache: Cache<
    [keyof ListFieldsOfFields<F>, ComponentType<ComponentProps<typeof DefaultList>>],
    MantineFieldComponent<SuppliedListProps, ComponentProps<typeof DefaultList>>
  > = new Cache(
    createList.bind(this),
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

  textInput<
    K extends keyof StringFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<SuppliedTextInputProps, TextInputProps>
  textInput<
    K extends keyof StringFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedTextInputProps<any>,
  >(
    valuePath: K,
    TextInput?: ComponentType<P>,
    ErrorRenderer?: ErrorRenderer<ErrorTypeOfField<F[K]>>,
  ): MantineFieldComponent<SuppliedTextInputProps, P>
  textInput<
    K extends keyof StringFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedTextInputProps<any>,
  >(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    TextInput: ComponentType<P> = TextInputImpl as ComponentType<P>,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ): MantineFieldComponent<SuppliedTextInputProps, P> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.textInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      TextInput as ComponentType<SuppliedTextInputProps>,
      ErrorRenderer,
    ) as MantineFieldComponent<SuppliedTextInputProps, P>
  }

  valueInput<
    K extends keyof AllFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedValueInputProps<ValueTypeOfField<F[K]>, any>,
  >(
    valuePath: K,
    ValueInput: ComponentType<P>,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ): MantineFieldComponent<SuppliedValueInputProps<ValueTypeOfField<F[K]>>, P> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.valueInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      ValueInput as ComponentType<SuppliedValueInputProps<ValueTypeOfField<F[K]>>>,
      ErrorRenderer,
    ) as MantineFieldComponent<SuppliedTextInputProps, P>
  }

  select<
    K extends keyof StringFieldsOfFields<F>,
  >(
    valuePath: K,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.valueInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      SimpleSelect as ComponentType<SuppliedValueInputProps<ValueTypeOfField<F[K]>>>,
      ErrorRenderer,
    ) as MantineFieldComponent<SuppliedTextInputProps, ComponentProps<typeof SimpleSelect>>
  }

  checkbox<
    K extends keyof BooleanFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<SuppliedCheckboxProps, CheckboxProps>
  checkbox<
    K extends keyof BooleanFieldsOfFields<F>,
    P extends SuppliedCheckboxProps,
  >(
    valuePath: K,
    Checkbox: ComponentType<P>,
    ErrorRenderer?: ErrorRenderer<ErrorTypeOfField<F[K]>>,
  ): MantineFieldComponent<SuppliedCheckboxProps, P>
  checkbox<K extends keyof BooleanFieldsOfFields<F>, P extends SuppliedCheckboxProps>(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Checkbox: ComponentType<P> = CheckboxImpl as ComponentType<P>,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ): MantineFieldComponent<SuppliedCheckboxProps, P> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.checkboxCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Checkbox as ComponentType<SuppliedCheckboxProps>,
      ErrorRenderer,
    ) as MantineFieldComponent<SuppliedCheckboxProps, P>
  }

  radioGroup<
    K extends keyof StringFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<SuppliedRadioGroupProps, RadioGroupProps>
  radioGroup<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioGroupProps,
  >(
    valuePath: K,
    RadioGroup: ComponentType<P>,
    ErrorRenderer?: ErrorRenderer<ErrorTypeOfField<F[K]>>,
  ): MantineFieldComponent<SuppliedRadioGroupProps, P>
  radioGroup<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioGroupProps,
  >(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    RadioGroup: ComponentType<P> = RadioImpl.Group as ComponentType<PropsWithChildren<P>>,
    ErrorRenderer: ErrorRenderer<ErrorTypeOfField<F[K]>> = DefaultErrorRenderer,
  ): MantineFieldComponent<SuppliedRadioGroupProps, P> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.radioGroupCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      RadioGroup as ComponentType<SuppliedRadioGroupProps>,
      ErrorRenderer,
    ) as MantineFieldComponent<SuppliedRadioGroupProps, P>
  }

  radio<
    K extends keyof StringFieldsOfFields<F>,
  >(
    valuePath: K,
    value: ValueTypeOfField<F[K]>,
  ): MantineFieldComponent<SuppliedRadioProps, RadioProps>
  radio<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioProps,
  >(
    valuePath: K,
    value: ValueTypeOfField<F[K]>,
    Radio: ComponentType<P>,
  ): MantineFieldComponent<SuppliedRadioProps, P>
  radio<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioProps,
  >(
    valuePath: K,
    value: ValueTypeOfField<F[K]>,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Radio: ComponentType<P> = RadioImpl as ComponentType<P>,
  ): MantineFieldComponent<SuppliedRadioProps, P> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.radioCache.retrieveOrCreate(
      valuePath,
      value,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Radio as ComponentType<SuppliedRadioProps>,
    ) as MantineFieldComponent<SuppliedRadioProps, P>
  }

  pill<K extends keyof AllFieldsOfFields<F>>(valuePath: K): MantineFieldComponent<SuppliedPillProps, PillProps>
  pill<
    K extends keyof AllFieldsOfFields<F>,
    P extends SuppliedPillProps,
  >(
    valuePath: K,
    Pill: ComponentType<P>,
  ): MantineFieldComponent<SuppliedPillProps, P>
  pill<
    K extends keyof AllFieldsOfFields<F>,
    P extends SuppliedPillProps,
  >(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Pill: ComponentType<P> = PillImpl as ComponentType<P>,
  ): MantineFieldComponent<SuppliedPillProps, P> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.pillCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Pill as ComponentType<SuppliedPillProps>,
    ) as MantineFieldComponent<SuppliedPillProps, P>
  }

  list<
    K extends keyof ListFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<
    SuppliedListProps<ElementOfArray<F[K]>>,
    ComponentProps<typeof DefaultList<ElementOfArray<F[K]>>>
  > {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.listCache.retrieveOrCreate(
      valuePath,
      DefaultList,
    ) as MantineFieldComponent<
      SuppliedListProps<ElementOfArray<F[K]>>,
      ComponentProps<typeof DefaultList<ElementOfArray<F[K]>>>
    >
  }
}
