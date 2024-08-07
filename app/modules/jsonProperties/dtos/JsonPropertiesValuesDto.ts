interface JsonArray extends Array<JsonValue> {}
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;

export type JsonPropertiesValuesDto = {
  [key: string]: JsonValue | undefined;
};
