import * as schema from "../db/schema.js";
import { type Database, DRIZZLE } from "../db/database.module.js";
import { RouterService } from "../modules/router/router.service.js";
import { NetworksService } from "../modules/networks/networks.service.js";
import { DevicesService } from "../modules/devices/devices.service.js";
import { RulesService } from "../modules/rules/rules.service.js";
import { TagsService } from "../modules/tags/tags.service.js";
import { ClsServiceManager } from "nestjs-cls";

export const LogEvents = (entity: "network" | "device" | "rule" | "tag") => {
  return <
    T extends {
      new (
        db: Database,
        routerService: RouterService,
      ): NetworksService | DevicesService | RulesService | TagsService;
    },
  >(
    target: T,
  ) => {
    const entityTableDict = {
      network: "networks",
      device: "devices",
      tag: "tags",
      rule: "rules",
    };

    const cls = ClsServiceManager.getClsService();

    const createMethod = target.prototype["create"];
    if (createMethod) {
      target.prototype["create"] = async function (
        data: string,
        networkId?: string,
        ...args: (string | object)[]
      ) {
        return this.db.transaction(async (tx) => {
          cls.set("CURRENT_TRANSACTION", tx)
          const result = await createMethod.call(this, data, networkId, ...args);

          console.log(result.id)
          if (result) {
            await tx.insert(schema.events).values({
              action: "create",
              entity,
              entityObjectId: result.id,
              networkId: networkId,
              userId: cls.get("userId"),
            });
          }

          cls.set("CURRENT_TRANSACTION", null)
          return result;
        });
      };
    }

    const updateMethod = target.prototype["update"];
    if (updateMethod) {
      target.prototype["update"] = async function (
        id: string,
        data: object,
        networkId?: string,
        ...args: (string | object)[]
      ) {
        return this.db.transaction(async (tx) => {
          cls.set("CURRENT_TRANSACTION", tx)
          const oldData = await tx.query[entityTableDict[entity]].findFirst({
            where: { id: id },
          });

          const changes: { key: string; old: string; new: string }[] = [];

          if (oldData) {
            for (const [key, value] of Object.entries(data)) {
              if (value !== oldData[key]) {
                changes.push({
                  key: key,
                  old: oldData[key],
                  new: `${value}`,
                });
              }
            }
          }

          const result = await updateMethod.call(this, id, data, networkId, ...args);

          await tx.insert(schema.events).values({
            action: "update",
            entity: entity,
            entityObjectId: id,
            updatedFields: changes,
            networkId: networkId,
            userId: cls.get("userId"),
          });

          cls.set("CURRENT_TRANSACTION", null)
          return result;
        });
      };
    }

    const deleteMethod = target.prototype["delete"];
    if (deleteMethod) {
      target.prototype["delete"] = async function (
        id: string,
        networkId?: string,
        ...args: (string | object)[]
      ) {
        return this.db.transaction(async (tx) => {
          cls.set("CURRENT_TRANSACTION", tx)
          const result = await deleteMethod.call(this, id, ...args);

          await tx.insert(schema.events).values({
            action: "delete",
            entity: entity,
            entityObjectId: id,
            networkId: networkId,
            userId: cls.get("userId"),
          });

          cls.set("CURRENT_TRANSACTION", null)
          return result;
        });
      };
    }
  };
};
