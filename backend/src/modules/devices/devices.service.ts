import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CreateDeviceDto } from "common/dto/device/create-device";
import type { UpdateDeviceDto } from "common/dto/device/update-device";
import type { DeviceRelations } from "common/schemas/device/index";
import type { SQL } from "drizzle-orm";
import { and, eq, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { type Database, DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class DevicesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  private buildTagFilter(
    deviceId: typeof schema.devices.id,
    networkId: string,
    tags: string[],
  ): SQL {
    return sql`exists (
      select 1
      from ${schema.devicesTags}
      inner join ${schema.tags}
        on ${schema.devicesTags.tagId} = ${schema.tags.id}
      where ${schema.devicesTags.deviceId} = ${deviceId}
        and ${schema.tags.networkId} = ${networkId}
        and ${inArray(schema.tags.name, tags)}
    )`;
  }

  private buildReadFilters(
    devices: typeof schema.devices,
    networkId: string,
    tags: string[] | undefined,
    ownerId: string | undefined,
    q: string | undefined,
    id?: string,
  ): SQL[] {
    const filters: SQL[] = [eq(devices.networkId, networkId)];

    if (id) {
      filters.push(eq(devices.id, id));
    }

    if (tags?.length) {
      filters.push(this.buildTagFilter(devices.id, networkId, tags));
    }

    if (ownerId) {
      filters.push(eq(devices.ownerId, ownerId));
    }

    if (q) {
      filters.push(sql`${devices.name} % ${q}`);
    }

    return filters;
  }

  async create(device: CreateDeviceDto, networkId: string) {
    await this.db.insert(schema.devices).values({ ...device, networkId });
  }

  async read(
    networkId: string,
    id: string,
  ): Promise<DeviceRelations | undefined>;
  async read(
    networkId: string,
    id?: undefined,
    tagsStr?: string,
    ownerId?: string,
    q?: string,
  ): Promise<DeviceRelations[]>;
  async read(
    networkId: string,
    id?: string,
    tagsStr?: string,
    ownerId?: string,
    q?: string,
  ): Promise<DeviceRelations | DeviceRelations[] | undefined> {
    const tags = tagsStr?.split(",").filter(Boolean);
    const withTags = {
      tags: {
        columns: {
          id: true,
          name: true,
          color: true,
        },
      },
    } as const;

    if (id) {
      return this.db.query.devices.findFirst({
        where: {
          RAW: (devices) =>
            and(
              ...this.buildReadFilters(
                devices,
                networkId,
                tags,
                ownerId,
                q,
                id,
              ),
            )!,
        },
        with: withTags,
      });
    }

    return this.db.query.devices.findMany({
      where: {
        RAW: (devices) =>
          and(...this.buildReadFilters(devices, networkId, tags, ownerId, q))!,
      },
      with: withTags,
      ...(q
        ? {
            orderBy: (devices, { desc }) =>
              desc(sql`similarity(${devices.name}, ${q})`),
          }
        : {}),
    });
  }

  async update(id: string, networkId: string, device: UpdateDeviceDto) {
    await this.db
      .update(schema.devices)
      .set(device)
      .where(
        and(eq(schema.devices.id, id), eq(schema.devices.networkId, networkId)),
      );
  }

  async delete(id: string) {
    await this.db.delete(schema.devices).where(eq(schema.devices.id, id));
  }

  async addTag(deviceId: string, tagId: string) {
    const tagRes = await this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.id, tagId));
    if (tagRes.length === 0) {
      throw new NotFoundException("Tag doesn't exists");
    }

    const deviceRes = await this.db
      .select()
      .from(schema.devices)
      .where(eq(schema.devices.id, deviceId));
    if (deviceRes.length === 0) {
      throw new NotFoundException("Device doesn't exists");
    }

    const tag = tagRes[0];
    const device = deviceRes[0];

    if (tag.networkId !== device.networkId) {
      throw new BadRequestException("Tag and device must be in one network");
    }
    await this.db.insert(schema.devicesTags).values({
      deviceId: deviceId,
      tagId: tagId,
    });
  }

  async deleteTag(deviceId: string, tagId: string) {
    await this.db
      .delete(schema.devicesTags)
      .where(
        and(
          eq(schema.devicesTags.deviceId, deviceId),
          eq(schema.devicesTags.tagId, tagId),
        ),
      );
  }
}
