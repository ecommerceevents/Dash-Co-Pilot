import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import { JsonValue } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";

const getText = (form: FormData, name: string): string | undefined => {
  const value = form.get(name);
  if (value === undefined || value === null) {
    return undefined;
  }
  return value.toString();
};

const getNumber = (form: FormData, name: string): number | undefined => {
  const value = form.get(name);
  if (value === undefined || value === null) {
    return undefined;
  }
  return Number(value);
};

const getBoolean = (form: FormData, name: string): boolean | undefined => {
  const value = form.get(name);
  if (value === undefined || value === null) {
    return undefined;
  }
  if (value === "false" || value === "0" || value === "off") {
    return false;
  }
  return value === "true" || value === "1" || value === "on" || Boolean(value);
};

const getDate = (form: FormData, name: string): Date | undefined => {
  const value = form.get(name);
  if (value === undefined || value === null || !value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  } else if (typeof value === "string") {
    return new Date(value);
  } else if (typeof value === "number") {
    return new Date(value);
  } else {
    return undefined;
  }
};

const getDateString = (form: FormData, name: string): string | undefined => {
  const value = form.get(name);
  if (value === undefined || value === null || !value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    return new Date(value).toISOString();
  } else {
    return undefined;
  }
};

const getFormMedia = (form: FormData, name: string): MediaDto[] => {
  const items: MediaDto[] = form.getAll(name + "[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });
  return items;
};

const getFormFirstMedia = (form: FormData, name: string): MediaDto | undefined => {
  const medias = getFormMedia(form, name);
  if (medias.length > 0) {
    return medias[0];
  }
};

const getMultiple = (form: FormData, name: string): RowValueMultipleDto[] => {
  let multiple: RowValueMultipleDto[] = form.getAll(name + "[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });
  return multiple;
};

const getJsonArray = (form: FormData, name: string): JsonValue[] => {
  let multiple: JsonValue[] = form.getAll(name + "[]").map((f: FormDataEntryValue) => {
    return f as JsonValue;
  });
  return multiple;
};

const getNumberRange = (form: FormData, name: string): RowValueRangeDto => {
  const min = form.get(name + "-min");
  const max = form.get(name + "-max");
  let range: RowValueRangeDto = {
    numberMin: min ? Number(min ?? 0) : 0,
    numberMax: max ? Number(max ?? 0) : 0,
    dateMin: null,
    dateMax: null,
  };
  return range;
};

const getDateRange = (form: FormData, name: string): RowValueRangeDto => {
  const min = form.get(name + "-min");
  const max = form.get(name + "-max");
  let range: RowValueRangeDto = {
    numberMin: null,
    numberMax: null,
    dateMin: min ? new Date(min?.toString()) : null,
    dateMax: max ? new Date(max?.toString()) : null,
  };
  return range;
};

export default {
  getText,
  getNumber,
  getBoolean,
  getDate,
  getDateString,
  getFormMedia,
  getFormFirstMedia,
  getMultiple,
  getJsonArray,
  getNumberRange,
  getDateRange,
};
