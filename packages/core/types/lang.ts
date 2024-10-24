export type MaybeReadonly<T, R extends boolean> = R extends true ? Readonly<T> : T

export type MaybePartial<T, P extends boolean> = P extends true ? Partial<T> : T

// https://stackoverflow.com/questions/61412688/how-to-view-full-type-definition-on-hover-in-vscode-typescript
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
