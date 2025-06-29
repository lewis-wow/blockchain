export type Serializable =
  | string
  | number
  | null
  | undefined
  | Date
  | Serializable[]
  | { [key: string]: Serializable };
