Type definitions for specifying and modifying types

# Define Your Types

One of the goals of @strictly/form is to provide a type-safe mapping between your display types and your domain types. In order to achieve this we need to be able to specify those types.

## Defining Types

Types are [Zod](https://zod.dev/) schemas. Any Zod schema is a valid type, so a type can be written with Zod directly

```ts
import { z } from 'zod'

const petOwnerType = z.object({
  firstName: z.string(),
  surname: z.string(),
})
```

## Type Builder

The builder produces the same Zod schemas, with a fluent API that can also attach the information Zod does not describe

- **rules** with typed errors, and the context those rules need, via `enforce`
- **annotations** that tell a form whether a field is `required` or `readonly`
- **readonly fields**, which cannot be reassigned, as opposed to readonly values, which cannot be modified

```ts
import {
  list,
  object,
  readonlyField,
  stringType,
  union,
} from '@strictly/define'

const speciesType = union('type')
  .or('dog', object().field('barks', numberType.required()))
  .or('cat', object().field('meows', numberType.required())).narrow

const petType = object()
  .field('name', stringType.enforce(new MinimumStringLengthValidator(3)))
  .field('tags', list(stringType))
  .readonlyField('species', speciesType).narrow
```

`narrow` returns the Zod schema. The rules and annotations ride along in the type and in a registry keyed by the schema, so `z.output`, `parse` and every other Zod tool see an ordinary schema. Zod's own `parse` does not run the rules, the form runtime does.

Readonly fields can also be declared on plain Zod objects with `readonlyField`

```ts
const petType = z.object({
  species: readonlyField(speciesType),
})
```

# Transforming Types

## Modifying Types

`ValueOfType` derives the type of a value from a schema, honouring readonly fields. `ReadonlyTypeOfType` describes a type whose values are readonly all the way down. `FlattenedTypesOfType` maps every path in a type (`$.tags.*`, `$.species:dog.barks`) to the schema at that path, and `FlattenedValidatorsOfValidatingType` maps the paths that have rules to typed validators.

## Modifying Values

`copy`, `mobxCopy` and `equals` walk values according to their schema, and `flattenValueTo` maps every path in a value.

# FAQ

## Why a builder on top of Zod?

Zod describes the shape of a value. A form also needs to know which errors a value can produce, what context is required to validate it, whether a field is required, and whether a field, as distinct from its value, is readonly. The builder attaches that information to Zod schemas without changing them, so the schema stays usable everywhere Zod is.
