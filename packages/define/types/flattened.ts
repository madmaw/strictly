// Unfortunately the TS compiler will infinitely loop if we don't give it a way of breaking out.
// A starting depth of 10 (the maximum) will cause performance issues while developing
export type StartingDepth = 8
// Going much above a depth of 10 will also blow up
export type Depths = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
