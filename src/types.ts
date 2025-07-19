export type JSONPrimitive = string | number | null | undefined | Date | boolean;

export type JSONData = JSONPrimitive | JSONArray | JSONObject;

export type JSONObject = { [key: string]: JSONData };

export type JSONArray = JSONData[];

export type Nullable<T> = { [P in keyof T]?: T[P] | undefined | null };

export type MaybePromise<T> = T | Promise<T>;
