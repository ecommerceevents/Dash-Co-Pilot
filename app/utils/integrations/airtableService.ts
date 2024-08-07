import { PropertyType } from "~/application/enums/entities/PropertyType";

// async function getBases({ apiKey }: { apiKey: string }) {
//   try {
//     const data = await fetch("https://api.airtable.com/v0/meta/bases", {
//       method: "GET",
//       headers: new Headers({
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       }),
//     });
//     const response = await data.json();
//     console.log({ data });
//     return response.bases as AirtableBase[];
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.log("AIRTABLE ERROR: ", e);
//   }
// }

type AirtableFieldType =
  | "autoNumber"
  | "barcode"
  | "button"
  | "checkbox"
  | "count"
  | "createdBy"
  | "createdTime"
  | "currency"
  | "date"
  | "dateTime"
  | "duration"
  | "email"
  | "externalSyncSource"
  | "formula"
  | "lastModifiedBy"
  | "lastModifiedTime"
  | "multilineText"
  | "multipleAttachments"
  | "multipleCollaborators"
  | "multipleLookupValues";
type AirtableTable = {
  id: string;
  name: string;
  description: string;
  primaryFieldId: string;
  fields: {
    id: string;
    name: string;
    description: string;
    type: AirtableFieldType;
  }[];
  views: {
    id: string;
    name: string;
    type: "grid" | "form" | "calendar" | "gallery" | "kanban";
  }[];
};
async function getBase(baseId: string, { apiKey }: { apiKey: string }) {
  // Airtable.configure({
  //   endpointUrl: "https://api.airtable.com",
  //   apiKey: "YOUR_API_KEY",
  // });
  // var base = Airtable.base("appsDGQIV5MtVmTob");
  // base("Accounts");
  // return base;
  const data = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  });
  const response = await data.json();
  return response.tables as AirtableTable[];
}

function mapFieldType(fieldType: AirtableFieldType): PropertyType {
  let type: PropertyType | undefined = undefined;
  switch (fieldType) {
    case "autoNumber":
      type = PropertyType.NUMBER;
      break;
    case "barcode":
      type = PropertyType.TEXT;
      break;
    case "button":
      type = PropertyType.TEXT;
      break;
    case "checkbox":
      type = PropertyType.BOOLEAN;
      break;
    case "count":
      type = PropertyType.NUMBER;
      break;
    case "createdBy":
      type = PropertyType.TEXT;
      break;
    case "createdTime":
      type = PropertyType.DATE;
      break;
    case "currency":
      type = PropertyType.NUMBER;
      break;
    case "date":
      type = PropertyType.DATE;
      break;
    case "dateTime":
      type = PropertyType.DATE;
      break;
    case "duration":
      type = PropertyType.NUMBER;
      break;
    case "email":
      type = PropertyType.TEXT;
      break;
    case "externalSyncSource":
      type = PropertyType.TEXT;
      break;
    case "formula":
      type = PropertyType.TEXT;
      break;
    case "lastModifiedBy":
      type = PropertyType.TEXT;
      break;
    case "lastModifiedTime":
      type = PropertyType.DATE;
      break;
    case "multilineText":
      type = PropertyType.TEXT;
      break;
    case "multipleAttachments":
      type = PropertyType.TEXT;
      break;
    case "multipleCollaborators":
      type = PropertyType.TEXT;
      break;
    case "multipleLookupValues":
      type = PropertyType.TEXT;
      break;
    default:
      type = PropertyType.TEXT;
      break;
  }
  return type;
}

export default {
  // getBases,
  getBase,
  mapFieldType,
};
