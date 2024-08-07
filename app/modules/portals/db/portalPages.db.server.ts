import { JsonPropertiesValuesDto } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import { db } from "~/utils/db.server";

export async function getPortalPages(portalId: string) {
  return await db.portalPage.findMany({
    where: {
      portalId,
    },
  });
}

export async function getPortalPagesByName(portalId: string, name: string) {
  return await db.portalPage.findUnique({
    where: {
      portalId_name: {
        portalId,
        name,
      },
    },
  });
}

export async function createPortalPage(data: { portalId: string; name: string; attributes: JsonPropertiesValuesDto }) {
  return await db.portalPage.create({
    data: {
      portalId: data.portalId,
      name: data.name,
      attributes: data.attributes,
    },
  });
}

export async function updatePortalPage(id: string, data: { attributes: JsonPropertiesValuesDto }) {
  return await db.portalPage.update({
    where: {
      id,
    },
    data: {
      attributes: data.attributes,
    },
  });
}

export async function deletePortalPage(id: string) {
  return await db.portalPage.delete({
    where: {
      id,
    },
  });
}
