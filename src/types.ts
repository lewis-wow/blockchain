/**
 * Represents a basic JSON primitive value.
 * This includes standard JavaScript primitive types that can be directly serialized to JSON,
 * plus `Date` which is typically serialized as a string.
 */
export type JSONPrimitive = string | number | null | undefined | Date | boolean;

/**
 * Represents any valid JSON data type.
 * This is a recursive type definition, allowing for nested JSON objects and arrays.
 */
export type JSONData = JSONPrimitive | JSONArray | JSONObject;

/**
 * Represents a JSON object, which is a dictionary-like structure where keys are strings
 * and values can be any `JSONData`.
 */
export type JSONObject = { [key: string]: JSONData };

/**
 * Represents a JSON array, which is an ordered list of `JSONData` values.
 */
export type JSONArray = JSONData[];

/**
 * A utility type that makes all properties of a given type `T` optional and nullable.
 * For each property `P` in `T`, its type becomes `T[P] | undefined | null`.
 * @template T - The type whose properties are to be made optional and nullable.
 */
export type Nullable<T> = { [P in keyof T]?: T[P] | undefined | null };

/**
 * A utility type that represents a value which could either be of type `T` directly,
 * or a `Promise` that resolves to type `T`.
 * This is useful for functions that might return a value synchronously or asynchronously.
 * @template T - The underlying type of the value.
 */
export type MaybePromise<T> = T | Promise<T>;
