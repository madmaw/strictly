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
import {
  Cache,
  type ElementOfArray,
} from '@strictly/base'
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
import { type ErrorOfField } from 'types/error_of_field'
import {
  type Fields,
} from 'types/field'
import { type ListFieldsOfFields } from 'types/list_fields_of_fields'
import { type StringFieldsOfFields } from 'types/string_fields_of_fields'
import { type SubFormFields } from 'types/sub_form_fields'
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
import { createSubForm } from './create_sub_form'
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
    [keyof StringFieldsOfFields<F>, ComponentType<SuppliedTextInputProps>],
    MantineFieldComponent<SuppliedTextInputProps>
  > = new Cache(
    createTextInput.bind(this),
  )
  private readonly valueInputCache: Cache<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [keyof AllFieldsOfFields<F>, ComponentType<SuppliedValueInputProps<any>>],
    MantineFieldComponent<SuppliedTextInputProps>
  > = new Cache(
    createValueInput.bind(this),
  )

  private readonly checkboxCache: Cache<
    [keyof BooleanFieldsOfFields<F>, ComponentType<SuppliedCheckboxProps>],
    MantineFieldComponent<SuppliedCheckboxProps>
  > = new Cache(
    createCheckbox.bind(this),
  )
  private readonly radioGroupCache: Cache<
    [keyof StringFieldsOfFields<F>, ComponentType<SuppliedRadioGroupProps>],
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
  private readonly subFormCache: Cache<
    // the cache cannot reference keys, so we just use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [keyof AllFieldsOfFields<F>, ComponentType<any>, FormProps<F>],
    ComponentType
  > = new Cache(
    createSubForm.bind(this),
  )

  @observable.ref
  accessor fields: F
  onFieldValueChange!: <K extends keyof F>(this: void, key: K, value: F[K]['value']) => void
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
  ): MantineFieldComponent<SuppliedTextInputProps, P>
  textInput<
    K extends keyof StringFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedTextInputProps<any>,
  >(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    TextInput: ComponentType<P> = TextInputImpl as ComponentType<P>,
  ): MantineFieldComponent<SuppliedTextInputProps, P, ErrorOfField<F[K]>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.textInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      TextInput as ComponentType<SuppliedTextInputProps>,
    ) as MantineFieldComponent<SuppliedTextInputProps, P, ErrorOfField<F[K]>>
  }

  valueInput<
    K extends keyof AllFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedValueInputProps<ValueTypeOfField<F[K]>, any>,
  >(
    valuePath: K,
    ValueInput: ComponentType<P>,
  ): MantineFieldComponent<SuppliedValueInputProps<ValueTypeOfField<F[K]>>, P, ErrorOfField<F[K]>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.valueInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      ValueInput as ComponentType<SuppliedValueInputProps<ValueTypeOfField<F[K]>>>,
    ) as MantineFieldComponent<SuppliedTextInputProps, P, ErrorOfField<F[K]>>
  }

  select<
    K extends keyof StringFieldsOfFields<F>,
  >(valuePath: K) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.valueInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      SimpleSelect as ComponentType<SuppliedValueInputProps<ValueTypeOfField<F[K]>>>,
    ) as MantineFieldComponent<SuppliedTextInputProps, ComponentProps<typeof SimpleSelect>, ErrorOfField<F[K]>>
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
  ): MantineFieldComponent<SuppliedCheckboxProps, P, ErrorOfField<F[K]>>
  checkbox<K extends keyof BooleanFieldsOfFields<F>, P extends SuppliedCheckboxProps>(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Checkbox: ComponentType<P> = CheckboxImpl as ComponentType<P>,
  ): MantineFieldComponent<SuppliedCheckboxProps, P, ErrorOfField<F[K]>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.checkboxCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Checkbox as ComponentType<SuppliedCheckboxProps>,
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
  ): MantineFieldComponent<SuppliedRadioGroupProps, P>
  radioGroup<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioGroupProps,
  >(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    RadioGroup: ComponentType<P> = RadioImpl.Group as ComponentType<PropsWithChildren<P>>,
  ): MantineFieldComponent<SuppliedRadioGroupProps, P, ErrorOfField<F[K]>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.radioGroupCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      RadioGroup as ComponentType<SuppliedRadioGroupProps>,
    ) as MantineFieldComponent<SuppliedRadioGroupProps, P, ErrorOfField<F[K]>>
  }

  radio<
    K extends keyof StringFieldsOfFields<F>,
  >(
    valuePath: K,
    value: ValueTypeOfField<F[K]>,
  ): MantineFieldComponent<SuppliedRadioProps, RadioProps, ErrorOfField<F[K]>>
  radio<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioProps,
  >(
    valuePath: K,
    value: ValueTypeOfField<F[K]>,
    Radio: ComponentType<P>,
  ): MantineFieldComponent<SuppliedRadioProps, P, ErrorOfField<F[K]>>
  radio<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioProps,
  >(
    valuePath: K,
    value: ValueTypeOfField<F[K]>,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Radio: ComponentType<P> = RadioImpl as ComponentType<P>,
  ): MantineFieldComponent<SuppliedRadioProps, P, ErrorOfField<F[K]>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.radioCache.retrieveOrCreate(
      valuePath,
      value,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Radio as ComponentType<SuppliedRadioProps>,
    ) as MantineFieldComponent<SuppliedRadioProps, P>
  }

  pill<
    K extends keyof AllFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<SuppliedPillProps, PillProps, ErrorOfField<F[K]>>
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
  ): MantineFieldComponent<SuppliedPillProps, P, ErrorOfField<F[K]>> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.pillCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Pill as ComponentType<SuppliedPillProps>,
    ) as MantineFieldComponent<SuppliedPillProps, P, ErrorOfField<F[K]>>
  }

  list<
    K extends keyof ListFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<
    SuppliedListProps<`${K}.${number}`>,
    ComponentProps<typeof DefaultList<ElementOfArray<F[K]['value']>, K>>
  > {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.listCache.retrieveOrCreate(
      valuePath,
      DefaultList,
    ) as MantineFieldComponent<
      SuppliedListProps<`${K}.${number}`>,
      ComponentProps<typeof DefaultList<ElementOfArray<F[K]['value']>, K>>,
      ErrorOfField<F[K]>
    >
  }

  // TODO have the returned component take any non-overlapping props as props
  subForm<
    K extends keyof AllFieldsOfFields<F>,
    S extends SubFormFields<F, K>,
  >(valuePath: K, SubForm: ComponentType<FormProps<S>>): ComponentType {
    return this.subFormCache.retrieveOrCreate(
      valuePath,
      // strip props from component since we lose information in the cache
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      SubForm as ComponentType,
      this,
    )
  }
}
