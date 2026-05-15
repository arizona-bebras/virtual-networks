import { generateKeyPairSync } from "node:crypto";
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
import { ilike, sql } from "drizzle-orm/sql";
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
    if (!Array.isArray(tags)) {
      tags = [tags];
    }
    const tagsFilter = inArray(schema.tags.id, tags);

    return sql`exists (
      select 1
      from ${schema.devicesTags}
      inner join ${schema.tags}
        on ${schema.devicesTags.tagId} = ${schema.tags.id}
      where ${schema.devicesTags.deviceId} = ${deviceId}
        and ${schema.tags.networkId} = ${networkId}
        and ${tagsFilter}
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
      filters.push(ilike(devices.name, `${q}%`));
    }

    return filters;
  }

  async create(device: Required<CreateDeviceDto>, networkId: string) {
    return this.db.transaction(async (tx) => {
      const { publicKey, privateKey } = generateKeyPairSync("x25519");
      const [keys] = await tx
        .insert(schema.keys)
        .values({
          publicKey: publicKey.export({ type: "spki", format: "der" }),
          privateKey: privateKey.export({ type: "pkcs8", format: "der" }),
        })
        .returning();
      await tx
        .insert(schema.devices)
        .values({ ...device, keysId: keys.id, networkId });
    });
  }

  async read(
    networkId: string,
    id: string,
  ): Promise<DeviceRelations | undefined>;
  async read(
    networkId: string,
    id?: undefined,
    tags?: string[],
    ownerId?: string,
    q?: string,
  ): Promise<DeviceRelations[]>;
  async read(
    networkId: string,
    id?: string,
    tags?: string[],
    ownerId?: string,
    q?: string,
  ): Promise<DeviceRelations | DeviceRelations[] | undefined> {
    if (id) {
      return this.db.query.devices.findFirst({
        columns: {
          keysId: false,
        },
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
        with: {
          tags: {
            columns: {
              id: true,
              name: true,
              color: true,
            },
          },
          owner: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return this.db.query.devices.findMany({
      columns: {
        keysId: false,
      },
      where: {
        RAW: (devices) =>
          and(...this.buildReadFilters(devices, networkId, tags, ownerId, q))!,
      },
      with: {
        tags: {
          columns: {
            id: true,
            name: true,
            color: true,
          },
        },
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      ...(q
        ? {
            orderBy: (devices, { asc }) => asc(sql`length(${devices.name})`),
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
    const tag = await this.db.query.tags.findFirst({
      where: {
        id: tagId,
      },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with id ${tagId} not found`);
    }

    const device = await this.db.query.devices.findFirst({
      where: {
        id: deviceId,
      },
    });
    if (!device) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

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
