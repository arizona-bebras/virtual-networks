import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm/sql/expressions/conditions";
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

  async read(id: string) {
    return await this.db
      .select()
      .from(schema.devices)
      .where(eq(schema.devices.id, id));
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
