import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../../../db/connection";
import { devices } from "../../../db/schema";
import type { Device } from "../interfaces/network.interface";

@Injectable()
export class DevicesService {
  async create(device: Device, network_id: string) {
    device.network_id = network_id;
    await db.insert(devices).values(device);
  }

  async read(id: string) {
    return await db.select().from(devices).where(eq(devices.id, id));
  }

  async update(id: string, device: Device) {
    await db.update(devices).set(device).where(eq(devices.id, id));
  }

  async delete(id: string) {
    await db.delete(devices).where(eq(devices.id, id));
  }
}
