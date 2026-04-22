import { Inject, Injectable } from "@nestjs/common";
import { AnyColumn, SQLWrapper } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm/sql";
import { and, eq, inArray } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";
import type { Device } from "./interfaces/device.interface";

@Injectable()
export class DevicesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(device: Device, networkId: string) {
    device.networkId = networkId;
    await this.db.insert(schema.devices).values(device);
  }

  async read(
    networkId: string,
    id?: string,
    tagsStr?: string,
    ownerId?: string,
    q?: string,
  ) {
    const tags = tagsStr?.split(",").filter(Boolean);

    const conditions: (AnyColumn | SQLWrapper)[] = [];

    if (id) {
      conditions.push(eq(schema.devices.id, id));
    }

    if (tags?.length) {
      conditions.push(inArray(schema.tags.name, tags));
    }

    if (ownerId) {
      conditions.push(eq(schema.devices.ownerId, ownerId));
    }

    if (q) {
      conditions.push(sql`${schema.devices.name} % ${q}`);
    }
    console.log(id, tags, ownerId);

    return await this.db
      .select()
      .from(schema.devices)
      .leftJoin(
        schema.devicesTags,
        eq(schema.devicesTags.deviceId, schema.devices.id),
      )
      .leftJoin(schema.tags, eq(schema.devicesTags.tagId, schema.tags.id))
      .where(and(...conditions, eq(schema.devices.networkId, networkId)))
      .orderBy(sql`similarity(${schema.devices.name}, ${q}) DESC`);
  }

  async update(id: string, device: Device) {
    await this.db
      .update(schema.devices)
      .set(device)
      .where(eq(schema.devices.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.devices).where(eq(schema.devices.id, id));
  }
}
