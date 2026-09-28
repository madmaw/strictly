export async function asyncReduce<T, Acc>(
  arr: readonly T[],
  reducer: (acc: Acc, v: T, index: number) => Promise<Acc>,
  initial: Acc,
): Promise<Acc> {
  let acc = initial
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    acc = await reducer(acc, v, i)
  }
  return acc
}
