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
import {
  type FieldsViewProps,
  type FormProps,
} from 'core/props'
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
import { type AllFieldsOfFields } from 'types/AllFieldsOfFields'
import { type BooleanFieldsOfFields } from 'types/BooleanFieldsOfFields'
import { type ErrorOfField } from 'types/ErrorOfField'
import {
  type Fields,
} from 'types/Field'
import { type ListFieldsOfFields } from 'types/ListFieldsOfFields'
import { type StringFieldsOfFields } from 'types/StringFieldsOfFields'
import { type SubFormFields } from 'types/SubFormFields'
import { type ValueTypeOfField } from 'types/ValueTypeOfField'
import { type RefOfProps } from 'util/Partial'
import {
  createCheckbox,
  type SuppliedCheckboxProps,
} from './createCheckbox'
import {
  createFieldsView,
  type FieldsView,
} from './createFieldsView'
import {
  createFieldView,
  type FieldViewProps,
} from './createFieldView'
import { createForm } from './createForm'
import {
  createList,
  DefaultList,
  type SuppliedListProps,
} from './createList'
import {
  createPill,
  type SuppliedPillProps,
} from './createPill'
import {
  createRadio,
  type SuppliedRadioProps,
} from './createRadio'
import {
  createRadioGroup,
  type SuppliedRadioGroupProps,
} from './createRadioGroup'
import {
  createTextInput,
  type SuppliedTextInputProps,
} from './createTextInput'
import {
  createValueInput,
  type SuppliedValueInputProps,
} from './createValueInput'
import {
  type MantineFieldComponent,
  type MantineForm,
} from './types'

function SimpleSelect(props: SelectProps & {
  onChange?: (value: string | null) => void,
}) {
  return <Select {...props} />
}

export function useMantineFormFields<
  F extends Fields,
>({
  onFieldValueChange,
  onFieldBlur,
  onFieldFocus,
  onFieldSubmit,
  fields,
  // should use FieldView rather than observing fields directly from here
}: FieldsViewProps<F>): Omit<MantineFormImpl<F>, 'fields'> {
  const form = useMemo(
    function () {
      return new MantineFormImpl(fields)
    },
    // fields handled separately below
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MantineFieldComponent<SuppliedValueInputProps<any>>
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
  private readonly fieldViewCache: Cache<
    [keyof AllFieldsOfFields<F>],
    ComponentType<FieldViewProps<F, Exclude<keyof AllFieldsOfFields<F>, number | symbol>>>
  > = new Cache(
    createFieldView.bind(this),
  )
  private readonly fieldsViewCache: Cache<
    // the cache cannot reference keys, so we just use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [keyof AllFieldsOfFields<F>, ComponentType<any>, FieldsViewProps<F>],
    FieldsView
  > = new Cache(
    createFieldsView.bind(this),
  )
  private readonly formCache: Cache<
    // the cache cannot reference keys, so we just use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [keyof AllFieldsOfFields<F>, ComponentType<any>, FieldsViewProps<F>],
    ComponentType
  > = new Cache(createForm.bind(this))

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
  >(valuePath: K): MantineFieldComponent<SuppliedTextInputProps, TextInputProps, ErrorOfField<F[K]>, HTMLInputElement>
  textInput<
    K extends keyof StringFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedTextInputProps<any>,
  >(
    valuePath: K,
    TextInput?: ComponentType<P>,
  ): MantineFieldComponent<SuppliedTextInputProps, P, ErrorOfField<F[K]>, RefOfProps<P, HTMLInputElement>>
  textInput<
    K extends keyof StringFieldsOfFields<F>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends SuppliedTextInputProps<any>,
  >(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    TextInput: ComponentType<P> = TextInputImpl as ComponentType<P>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): MantineFieldComponent<SuppliedTextInputProps, P, ErrorOfField<F[K]>, any> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.textInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      TextInput as ComponentType<SuppliedTextInputProps>,
    ) as unknown as MantineFieldComponent<SuppliedTextInputProps, P, ErrorOfField<F[K]>>
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
    ) as unknown as MantineFieldComponent<SuppliedValueInputProps<ValueTypeOfField<F[K]>>, P, ErrorOfField<F[K]>>
  }

  select<
    K extends keyof StringFieldsOfFields<F>,
  >(valuePath: K) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.valueInputCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      SimpleSelect as ComponentType<SuppliedValueInputProps<ValueTypeOfField<F[K]>>>,
    ) as unknown as MantineFieldComponent<
      SuppliedValueInputProps<ValueTypeOfField<F[K]>>,
      ComponentProps<typeof SimpleSelect>,
      ErrorOfField<F[K]>,
      HTMLSelectElement
    >
  }

  checkbox<
    K extends keyof BooleanFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<SuppliedCheckboxProps, CheckboxProps, ErrorOfField<F[K]>, HTMLInputElement>
  checkbox<
    K extends keyof BooleanFieldsOfFields<F>,
    P extends SuppliedCheckboxProps,
  >(
    valuePath: K,
    Checkbox: ComponentType<P>,
  ): MantineFieldComponent<SuppliedCheckboxProps, P, ErrorOfField<F[K]>, RefOfProps<P, HTMLInputElement>>
  checkbox<K extends keyof BooleanFieldsOfFields<F>, P extends SuppliedCheckboxProps>(
    valuePath: K,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Checkbox: ComponentType<P> = CheckboxImpl as ComponentType<P>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): MantineFieldComponent<SuppliedCheckboxProps, P, ErrorOfField<F[K]>, any> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.checkboxCache.retrieveOrCreate(
      valuePath,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Checkbox as ComponentType<SuppliedCheckboxProps>,
    ) as unknown as MantineFieldComponent<SuppliedCheckboxProps, P, ErrorOfField<F[K]>>
  }

  // this should work?
  radioGroup<
    K extends keyof StringFieldsOfFields<F>,
    P extends RadioGroupProps = RadioGroupProps,
  >(valuePath: K): MantineFieldComponent<SuppliedRadioGroupProps, P, ErrorOfField<F[K]>>
  radioGroup<
    K extends keyof StringFieldsOfFields<F>,
    P extends SuppliedRadioGroupProps,
  >(
    valuePath: K,
    RadioGroup: ComponentType<P>,
  ): MantineFieldComponent<SuppliedRadioGroupProps, P, ErrorOfField<F[K]>>
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
    ) as unknown as MantineFieldComponent<SuppliedRadioGroupProps, P, ErrorOfField<F[K]>>
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
    ) as unknown as MantineFieldComponent<SuppliedRadioProps, P, ErrorOfField<F[K]>>
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
  ): MantineFieldComponent<SuppliedPillProps, P, ErrorOfField<F[K]>>
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
    ) as unknown as MantineFieldComponent<SuppliedPillProps, P, ErrorOfField<F[K]>>
  }

  list<
    K extends keyof ListFieldsOfFields<F>,
  >(valuePath: K): MantineFieldComponent<
    SuppliedListProps<`${K}.${number}`>,
    ComponentProps<typeof DefaultList<ElementOfArray<F[K]['value']>, K>>,
    never
  > {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.listCache.retrieveOrCreate(
      valuePath,
      DefaultList,
    ) as MantineFieldComponent<
      SuppliedListProps<`${K}.${number}`>,
      ComponentProps<typeof DefaultList<ElementOfArray<F[K]['value']>, K>>,
      never
    >
  }

  fieldView<K extends keyof AllFieldsOfFields<F>>(valuePath: K): ComponentType<FieldViewProps<F, K>> {
    return this.fieldViewCache.retrieveOrCreate(
      valuePath,
    )
  }

  fieldsView<
    K extends keyof AllFieldsOfFields<F>,
    P extends FieldsViewProps<Fields> = FieldsViewProps<SubFormFields<F, K>>,
  >(valuePath: K, FieldsView: ComponentType<P>): FieldsView<K, MantineFieldComponent<
    FieldsViewProps<P['fields']>,
    P,
    never
  >> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.fieldsViewCache.retrieveOrCreate(
      valuePath,
      // strip props from component since we lose information in the cache
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      FieldsView as ComponentType,
      this,
    ) as unknown as FieldsView<K, MantineFieldComponent<
      FieldsViewProps<P['fields']>,
      P,
      never
    >>
  }

  form<
    K extends keyof AllFieldsOfFields<F>,
    P extends FormProps<ValueTypeOfField<F[K]>> = FormProps<ValueTypeOfField<F[K]>>,
  >(
    valuePath: K,
    Form: ComponentType<P>,
  ): MantineFieldComponent<FormProps<ValueTypeOfField<F[K]>>, P, never> {
    // strip props from component since we lose information in the cache
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.formCache.retrieveOrCreate(
      valuePath,
      // strip props from component since we lose information in the cache
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Form as ComponentType,
      this,
    ) as unknown as MantineFieldComponent<FormProps<ValueTypeOfField<F[K]>>, P, never>
  }

  // TODO have an option to bind to a Text/(value: T) => ReactNode for viewing form fields
}
