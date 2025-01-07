import { type FieldAdapter } from 'core/mobx/field_adapter'
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
