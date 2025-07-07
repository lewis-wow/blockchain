export type JSONPrimitive = string | number | null | undefined | Date;

export type JSONData = JSONPrimitive | JSONArray | JSONObject;

export type JSONObject = { [key: string]: JSONData };

export type JSONArray = JSONData[];
