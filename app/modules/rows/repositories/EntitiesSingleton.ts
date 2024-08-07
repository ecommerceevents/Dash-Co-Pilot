import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

export default class EntitiesSingleton {
  private static instance: EntitiesSingleton;
  private entities: EntityWithDetails[] | undefined;
  private constructor(entities?: EntityWithDetails[]) {
    this.entities = entities;
  }
  public static getInstance(entities?: EntityWithDetails[]): EntitiesSingleton {
    if (!EntitiesSingleton.instance) {
      EntitiesSingleton.instance = new EntitiesSingleton(entities);
    }
    return EntitiesSingleton.instance;
  }
  public isSet() {
    return this.entities !== undefined;
  }
  public getEntities(): EntityWithDetails[] {
    if (!this.entities) {
      throw new Error("Entities not set: Call await EntitiesSingleton.load() before using RowRepository or EntityRepository");
    }
    return this.entities;
  }
  public setEntities(entities: EntityWithDetails[]): void {
    const instance = EntitiesSingleton.getInstance();
    instance.entities = entities;
  }
  public static getEntity(data: { name: string } | { id: string }): EntityWithDetails {
    const entities = EntitiesSingleton.getInstance().getEntities();
    if ("name" in data) {
      const entity = entities.find((f) => f.name === data.name);
      if (!entity) {
        throw new Error("Entity not found: " + data.name);
      }
      return entity;
    } else {
      const entity = entities.find((f) => f.id === data.id);
      if (!entity) {
        throw new Error("Entity not found: " + data.id);
      }
      return entity;
    }
  }
  public static getEntityByIdNameOrSlug(idNameOrSlug: string) {
    const entity = EntitiesSingleton.getInstance()
      .getEntities()
      .find((f) => f.id === idNameOrSlug || f.name === idNameOrSlug || f.slug === idNameOrSlug);
    if (!entity) {
      throw new Error(`Entity not found`);
    }
    return entity;
  }
}
