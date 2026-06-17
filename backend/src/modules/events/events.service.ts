import { Inject, Injectable } from "@nestjs/common";
import { EventDto } from "common/dto/event/index";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { type Database, DRIZZLE } from "../../db/database.module.js";

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
      tag: "tags",
      rule: "rules",
    };
    const eventLogs = await this.db.query.events.findMany({
      where: {
        RAW: (events) =>
          and(
            or(
              eq(events.networkId, networkId),
              eq(events.entityObjectId, networkId),
            ),
            action ? eq(events.action, action) : undefined,
            userId ? eq(events.userId, userId) : undefined,
            entity ? eq(events.entity, entity) : undefined,
            action ? eq(events.action, action) : undefined,
            afterDatetime
              ? gt(events.time, new Date(afterDatetime))
              : undefined,
            beforeDatetime
              ? lt(events.time, new Date(beforeDatetime))
              : undefined,
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
      const object = await this.db.query[
        entityToTableMap[log.entity]
      ].findFirst({
        where: {
          id: log.entityObjectId,
        },
      });
      const networkMembership = await this.db.query.networkUsers.findFirst({
        where: {
          userId: log.user?.id,
          networkId: log.networkId ?? log.entityObjectId ?? undefined,
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
