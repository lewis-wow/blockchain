export type JSONData =
  | string
  | number
  | null
  | undefined
  | Date
  | JSONData[]
  | { [key: string]: JSONData };
