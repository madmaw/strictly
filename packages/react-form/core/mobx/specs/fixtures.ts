import { type FieldAdapter } from 'core/mobx/FieldAdapter'
import { type TwoWayFieldConverter } from 'types/FieldConverters'
import { type Mocked } from 'vitest'
import {
  mock,
  mockReset,
} from 'vitest-mock-extended'

export function createMockedAdapter<
  E,
  To,
  From,
  ValuePath extends string,
>(_original: FieldAdapter<From, To, E, ValuePath>): Mocked<
  Required<FieldAdapter<From, To, E, ValuePath>>
> {
  return mock<Required<FieldAdapter<From, To, E, ValuePath>>>()
}

export function resetMockAdapter<
  E,
  To,
  From,
  ValuePath extends string,
>(
  {
    convert,
    revert,
    create,
  }: FieldAdapter<From, To, E, ValuePath>,
  mockedAdapter: Mocked<
    Required<FieldAdapter<From, To, E, ValuePath>>
  >,
): void {
  mockReset(mockedAdapter)
  if (revert) {
    mockedAdapter.revert?.mockImplementation(revert)
  }
  mockedAdapter.convert.mockImplementation(convert)
  mockedAdapter.create.mockImplementation(create)
}

export function createMockTwoWayFieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(_original: TwoWayFieldConverter<From, To, E, ValuePath, Context>): Mocked<
  TwoWayFieldConverter<From, To, E, ValuePath, Context>
> {
  return mock<TwoWayFieldConverter<From, To, E, ValuePath, Context>>()
}

export function resetMockTwoWayFieldConverter<
  From,
  To,
  E,
  ValuePath extends string,
  Context,
>(
  {
    convert,
    revert,
  }: TwoWayFieldConverter<From, To, E, ValuePath, Context>,
  mockedConverter: Mocked<
    TwoWayFieldConverter<From, To, E, ValuePath, Context>
  >,
) {
  mockReset(mockedConverter)
  mockedConverter.convert.mockImplementation(convert)
  mockedConverter.revert.mockImplementation(revert)
}
