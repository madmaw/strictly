export const RADIO_GROUP_LABEL = 'Radio Group'
export const RADIO_VALUES = [
  '1',
  '2',
  '3',
] as const
export type RadioValue = typeof RADIO_VALUES[number]
export const RADIO_LABELS: Record<RadioValue, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
}
