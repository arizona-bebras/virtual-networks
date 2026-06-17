import { Inject, Injectable } from "@nestjs/common";
import type { CreateTagDto } from "common/dto/tag/create-tag";
import { TagDto } from "common/dto/tag/index";
import type { UpdateTagDto } from "common/dto/tag/update-tag";
import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { ilike, sql } from "drizzle-orm/sql";
import { type Database, DRIZZLE } from "../../db/database.module.js";
import * as schema from "../../db/schema.js";
import { LogEvents } from "../../logging/logging.decorator.js";

@LogEvents("tag")
@Injectable()
export class TagsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  private buildReadFilters(networkId?: string, q?: string): SQL[] {
    const filters: SQL[] = [];

    if (networkId) {
      filters.push(eq(schema.tags.networkId, networkId));
    }

    if (q) {
      filters.push(ilike(schema.tags.name, `${q}%`));
    }

    return filters;
  }

  async create(tag: CreateTagDto, networkId: string) {
    const [createdTag] = await this.db.insert(schema.tags).values({ ...tag, networkId }).returning();
    return createdTag
  }

  async read(id: string, networkId: string): Promise<TagDto | undefined> {
    return this.db.query.tags.findFirst({
      where: {
        id,
        networkId,
      },
      extras: {
        devicesCount:
          sql<number>`SELECT COUNT(1) FROM ${schema.devicesTags} WHERE ${schema.devicesTags.tagId} = ${id}`.mapWith(
            Number,
          ),
      },
    });
  }

  async getAllTags(networkId: string, q?: string): Promise<TagDto[]> {
    return this.db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
        color: schema.tags.color,
        devicesCount: sql<number>`count(${schema.devicesTags.tagId})`.mapWith(
          Number,
        ),
      })
      .from(schema.tags)
      .leftJoin(
        schema.devicesTags,
        eq(schema.devicesTags.tagId, schema.tags.id),
      )
      .where(and(...this.buildReadFilters(networkId, q)))
      .groupBy(schema.tags.id)
      .orderBy(q ? sql`length(${schema.tags.name}) ASC` : schema.tags.name);
  }

  async update(id: string, tag: UpdateTagDto, networkId: string) {
    await this.db
      .update(schema.tags)
      .set(tag)
      .where(and(eq(schema.tags.id, id), eq(schema.tags.networkId, networkId)));
  }

  async delete(id: string, networkId: string) {
    await this.db
      .delete(schema.tags)
      .where(and(eq(schema.tags.id, id), eq(schema.tags.networkId, networkId)));
  }
}
