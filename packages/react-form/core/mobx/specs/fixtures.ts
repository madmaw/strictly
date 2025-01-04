import { type FieldAdapter } from 'core/mobx/field_adapter'
import { type Mocked } from 'vitest'
import {
  mock,
} from 'vitest-mock-extended'

export function createMockedAdapter<
  E,
  To,
  From,
  ValuePath extends string,
>({
  convert,
  revert,
  create,
}: FieldAdapter<From, To, E, ValuePath>): Mocked<
  Required<FieldAdapter<From, To, E, ValuePath>>
> {
  const mockedAdapter = mock<Required<FieldAdapter<From, To, E, ValuePath>>>()
  if (revert) {
    mockedAdapter.revert?.mockImplementation(revert)
  }
  mockedAdapter.convert.mockImplementation(convert)
  mockedAdapter.create.mockImplementation(create)

  return mockedAdapter
}
