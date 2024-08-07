import { RowValueMultiple, RowValueRange } from "@prisma/client";
import { Decimal } from "decimal.js";
import { PropertyWithDetails } from "../db/entities/entities.db.server";
import { PropertyType } from "~/application/enums/entities/PropertyType";

function getString({ urlSearchParams, property }: { urlSearchParams: URLSearchParams; property: PropertyWithDetails }): string | undefined {
  const value = urlSearchParams.get(property.name);
  if (value === null) {
    return undefined;
  }
  return value;
}

function getNumber({ urlSearchParams, property }: { urlSearchParams: URLSearchParams; property: PropertyWithDetails }): number | undefined {
  const value = urlSearchParams.get(property.name);
  if (value === null) {
    return undefined;
  }
  // see if it's a number
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return undefined;
  }
  return numberValue;
}

function getBoolean({ urlSearchParams, property }: { urlSearchParams: URLSearchParams; property: PropertyWithDetails }): boolean | undefined {
  const value = urlSearchParams.get(property.name);
  if (value === null) {
    return undefined;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

function getDate({ urlSearchParams, property }: { urlSearchParams: URLSearchParams; property: PropertyWithDetails }): Date | undefined {
  const value = urlSearchParams.get(property.name);
  if (value === null) {
    return undefined;
  }
  try {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      return undefined;
    }
    return dateValue;
  } catch (error) {
    return undefined;
  }
}

function getMultiple({ urlSearchParams, property }: { urlSearchParams: URLSearchParams; property: PropertyWithDetails }): RowValueMultiple[] | undefined {
  const values = urlSearchParams.getAll(property.name);
  if (values.length === 0) {
    return undefined;
  }
  return values.map((value, idx) => {
    return {
      id: "",
      rowValueId: "",
      order: idx,
      value,
    };
  });
}

function getRange({ urlSearchParams, property }: { urlSearchParams: URLSearchParams; property: PropertyWithDetails }): RowValueRange | undefined {
  if (property.type === PropertyType.RANGE_NUMBER) {
    const min = urlSearchParams.get(`${property.name}_min`);
    const max = urlSearchParams.get(`${property.name}_max`);
    if (min === null || max === null) {
      return undefined;
    }
    let numberMin: Decimal = new Decimal(0);
    let numberMax: Decimal = new Decimal(0);
    try {
      numberMin = new Decimal(min);
    } catch (error) {}
    try {
      numberMax = new Decimal(max);
    } catch (error) {}
    return {
      rowValueId: "",
      numberMin,
      numberMax,
      dateMin: null,
      dateMax: null,
    };
  } else if (property.type === PropertyType.RANGE_DATE) {
    const min = urlSearchParams.get(`${property.name}_min`);
    const max = urlSearchParams.get(`${property.name}_max`);
    if (min === null || max === null) {
      return undefined;
    }
    const dateMin = new Date(min);
    const dateMax = new Date(max);
    return {
      rowValueId: "",
      numberMin: null,
      numberMax: null,
      dateMin,
      dateMax,
    };
  } else {
    return undefined;
  }
}

export default {
  getString,
  getNumber,
  getBoolean,
  getDate,
  getMultiple,
  getRange,
};
