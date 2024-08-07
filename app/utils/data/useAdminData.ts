import { useMatches } from "@remix-run/react";
import { AppOrAdminData } from "./useAppOrAdminData";
import EntitiesSingleton from "~/modules/rows/repositories/EntitiesSingleton";

export type AdminLoaderData = AppOrAdminData;

export function useAdminData(): AdminLoaderData {
  const paths: string[] = ["routes/admin"];
  const adminData = (useMatches().find((f) => paths.includes(f.id.toLowerCase()))?.data ?? {}) as AdminLoaderData;
  EntitiesSingleton.getInstance().setEntities(adminData.entities);
  return adminData;
}
