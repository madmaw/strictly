export type FormatArg =
  | string
  | number
  | boolean
  | object
  | null
  | undefined

export function format(
  message: string,
  ...args: readonly FormatArg[]
): string {
  let index = 0
  return message.replaceAll(/{(\d*)}/g, function (_substring: string, indexString: string) {
    let argIndex = parseInt(indexString)
    if (Number.isNaN(argIndex)) {
      argIndex = index
      index++
    }
    return JSON.stringify(args[argIndex])
  })
}
