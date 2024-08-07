import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import EntitiesSingleton from "../EntitiesSingleton";

export async function loadEntities() {
  const instace = EntitiesSingleton.getInstance();
  if (!instace.isSet()) {
    const entities = await getAllEntities({ tenantId: null });
    instace.setEntities(entities);
  }
  return instace.getEntities();
}
