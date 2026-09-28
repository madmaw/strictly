import { type InputType } from '@storybook/csf'

type MetaArgType<T> = InputType & {
  t?: T,
}

export type MetaArgTypesOf<
  P,
> = {
  [k in keyof P]: MetaArgType<P[k]>
}

// Enforce the correct arg types for mapped storybooks
export type MetaArgsOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Types extends MetaArgTypesOf<any>,
> = {
  [k in keyof Types]: Types[k]['mapping'] extends undefined ? Required<Types[k]['t']> : keyof Types[k]['mapping']
}

// package up the args and the arg types
export type MetaArgsAndArgTypes<
  P,
  ArgTypes extends MetaArgTypesOf<P>,
  Args extends MetaArgsOf<ArgTypes> = MetaArgsOf<ArgTypes>,
> = {
  args: Partial<Args>,
  argTypes: Partial<ArgTypes>,
}

// Unfortunately the storybook typedefs are wrong and will complain if you supply a label as a value (although the implementation
// only picks up labels for args, not the referenced values), so we have to cast back to this. Additionally Storybook blows up if
// we provide a utility method to do this
// https://github.com/storybookjs/storybook/issues/16598
export type MetaPropsAndArgTypes<
  P,
> = {
  args: Partial<P>,
  argTypes: Partial<MetaArgTypesOf<P>>,
}
