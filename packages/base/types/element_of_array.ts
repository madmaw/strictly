export type ElementOfArray<A> = A extends readonly (infer T)[] ? T : never
