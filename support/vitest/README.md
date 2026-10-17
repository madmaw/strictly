# @strictly/vitest

Vitest assertions that narrow types, so tests can carry on without casts or non-null assertions.

```ts
import { expectDefined } from '@strictly/vitest'

const user = users.find(({ id }) => id === 1)
expectDefined(user)
expect(user.name).toBe('Ada')
```

- `expectDefined(v)` and `expectDefinedAndReturn(v)` narrow away `null` and `undefined`
- `expectEquals(v1, v2)` narrows `v1` to the type of `v2`
- `expectInstanceOf(v, Class)` narrows `v` to an instance of `Class`
- `expectTruthy(b)` narrows `b` to `true`
- `expectPendingPromise(p)` asserts that `p` has not settled within a timeout

The same assertions, backed by `storybook/test`, are exported from `@strictly/storybook` for use in story play functions.
