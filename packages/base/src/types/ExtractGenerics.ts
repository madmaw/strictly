export type ExtractPromiseType<T> = T extends Promise<infer V> ? V : never
export type ExtractArrayType<T> = T extends (infer V)[] ? V : never
