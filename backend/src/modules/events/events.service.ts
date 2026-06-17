import { Injectable, Inject } from "@nestjs/common";
import { type Database, DRIZZLE } from "../../db/database.module.js";
import * as schema from "../../db/schema.js";
import type { SQL } from "drizzle-orm";
import { and, eq, gt, lt } from "drizzle-orm";
import { EventDto } from "common/dto/event/index";

@Injectable()
export class EventsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async get(
    networkId: string,
    userId?: string,
    action?: "create" | "update" | "delete",
    entity?: "network" | "device" | "tag" | "rule",
    afterDatetime?: string,
    beforeDatetime?: string,
  ): Promise<EventDto[]> {
    const entityToTableMap = {
      network: "networks",
      device: "devices",
      tags: "tags",
      rules: "rules",
    };
    const filters: SQL[] = [eq(schema.events.networkId, networkId)];

    console.log(afterDatetime, beforeDatetime);

    if (userId) {
      filters.push(eq(schema.events.userId, userId));
    }

    if (entity) {
      filters.push(eq(schema.events.entity, entity));
    }

    if (action) {
      filters.push(eq(schema.events.action, action));
    }

    if (afterDatetime) {
      filters.push(gt(schema.events.time, new Date(afterDatetime)));
    }

    if (beforeDatetime) {
      filters.push(lt(schema.events.time, new Date(beforeDatetime)));
    }

    const eventLogs = await this.db.query.events.findMany({
      where: {
        RAW: (events) =>
          and(
            eq(events.networkId, networkId),
            action ? eq(events.action, action) : undefined,
            userId ? eq(events.userId, userId) : undefined,
            entity ? eq(events.entity, entity) : undefined,
            action ? eq(events.action, action) : undefined,
            afterDatetime ? gt(events.time, new Date(afterDatetime)) : undefined,
            beforeDatetime ? lt(events.time, new Date(beforeDatetime)) : undefined,
          )!,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const events: EventDto[] = [];

    for (const log of eventLogs) {
      let action: EventDto["action"];
      switch (log.action) {
        case "update":
          action = { type: "update", updatedFields: log.updatedFields };
          break;
        case "delete":
          action = { type: "delete" };
          break;
        default:
          action = { type: "create" };
      }
      const object = this.db.query[entityToTableMap[log.entity]].findFirst({
        where: {
          id: log.entity_object_id,
        },
      });
      const networkMembership = await this.db.query.networkUsers.findFirst({
        where: {
          userId: log.user?.id,
          networkId: log.networkId ?? log.entity_object_id ?? undefined,
        },
      });

      const mappedUser = log.user
        ? {
            id: log.user.id,
            name: log.user.name,
            email: log.user.email,
            role: networkMembership?.role ?? null,
          }
        : null;

      events.push({
        id: log.id,
        user: mappedUser,
        action,
        entity: {
          type: log.entity,
          info: object,
        },
        networkId: log.networkId,
        time: log.time.toISOString(),
      });
    }

    return events;
  }
}
