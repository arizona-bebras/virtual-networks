import { Inject, Injectable } from "@nestjs/common";
import type { CreateDeviceDto } from "common/dto/device/create-device";
import type { UpdateDeviceDto } from "common/dto/device/update-device";
import { and, desc, eq, exists, inArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm/sql";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class DevicesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(device: Required<CreateDeviceDto>, networkId: string) {
    await this.db.insert(schema.devices).values({ ...device, networkId });
  }

  async read(
    networkId: string,
    id?: string,
    tagsStr?: string,
    ownerId?: string,
    q?: string,
  ) {
    const tags = tagsStr?.split(",").filter(Boolean);

    const conditions = [eq(schema.devices.networkId, networkId)];

    if (id) {
      conditions.push(eq(schema.devices.id, id));
    }

    if (tags?.length) {
      conditions.push(
        exists(
          this.db
            .select({ value: sql`1` })
            .from(schema.devicesTags)
            .innerJoin(
              schema.tags,
              eq(schema.devicesTags.tagId, schema.tags.id),
            )
            .where(
              and(
                eq(schema.devicesTags.deviceId, schema.devices.id),
                eq(schema.tags.networkId, networkId),
                inArray(schema.tags.name, tags),
              ),
            ),
        ),
      );
    }

    if (ownerId) {
      conditions.push(eq(schema.devices.ownerId, ownerId));
    }

    if (q) {
      conditions.push(sql`${schema.devices.name} % ${q}`);
    }

    const query = this.db
      .select()
      .from(schema.devices)
      .where(and(...conditions));

    if (q) {
      query.orderBy(desc(sql`similarity(${schema.devices.name}, ${q})`));
    }

    return await query;
  }

  async update(id: string, device: UpdateDeviceDto) {
    await this.db
      .update(schema.devices)
      .set(device)
      .where(eq(schema.devices.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.devices).where(eq(schema.devices.id, id));
  }
}
