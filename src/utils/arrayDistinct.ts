export const getDistinctItem = (array: Array<{ T: any }>, field: string) => [
  ...new Set(array.map((item: any) => item[field])),
];
