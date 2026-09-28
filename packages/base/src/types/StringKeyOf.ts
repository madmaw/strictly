export type StringKeyOf<T> = Exclude<keyof T, number | symbol>
