Type definitions for specifying and modifying types

# Define Your Types

One of the goals of @strictly/form is to provide a type-safe mapping between your display types and your domain types. In order to achieve this we need to be able to specify those types.

## Defining Types

## Type Builder

# Transforming Types

## Modifying Types

## Modifying Values

# FAQ

## Why not use Zod (or equivalent)?

While [Zod](https://zod.dev/) is a great tool, with many, many features and great supporting libraries, it does not produce 100% introspectable type definitions. Our definitions need to be quite minimal, while Zod's are quite fully featured. The reasons for this are
1. The Typescript compiler is actually fairly limited in how much it processing it will do on a [Mapped Type](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) before it throws the dreaded `Type instantiation is excessively deep and possibly infinite. ts(2589)` [error](https://github.com/microsoft/TypeScript/issues/30188#issuecomment-469285102). The types we use are tuned to circumvent this restriction as much as possible.
2. @strictly transforms the type definitions in multiple ways. The more variation allowed in the base types, the more cases the transformers need to deal with (and the more processing we need to do on those mapped types). Essentially the amount of code you have to write is quadratic (the number of supported type definitions multiplied by the number of transformations). As the number of transformations is potentially unbounded, keeping the number of distinct type definitions to a minimum is key

It's a definite possibility that someone could write an adapter from Zod to our internal type definitions, but it's not practical to use Zod in place of the internal type definitions.

