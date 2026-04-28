import { Inject, Injectable } from "@nestjs/common";
import type { CreateTagDto } from "common/dto/tag/create-tag";
import type { UpdateTagDto } from "common/dto/tag/update-tag";
import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { ilike, sql } from "drizzle-orm/sql";
import { type Database, DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

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
    await this.db.insert(schema.tags).values({ ...tag, networkId });
  }

  async read(id: string) {
    return this.db.query.tags.findFirst({
      where: {
        id,
      },
    });
  }

  async getAllTags(networkId: string, q?: string) {
    return this.db
      .select()
      .from(schema.tags)
      .where(and(...this.buildReadFilters(networkId, q)))
      .orderBy(
        q ? sql`length(${schema.tags.name}) ASC` : schema.tags.name,
      );
  }

  async update(id: string, tag: UpdateTagDto) {
    await this.db.update(schema.tags).set(tag).where(eq(schema.tags.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.tags).where(eq(schema.tags.id, id));
  }
}
