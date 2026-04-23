import { Inject, Injectable } from "@nestjs/common";
import type { CreateTagDto } from "common/dto/tag/create-tag";
import type { UpdateTagDto } from "common/dto/tag/update-tag";
import { and, eq } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
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
      filters.push(sql`${schema.tags.name} % ${q}`);
    }

    return filters;
  }

  async create(tag: CreateTagDto, networkId: string) {
    await this.db.insert(schema.tags).values({ ...tag, networkId });
  }

  async read(id: string) {
    const [tag] = await this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.id, id))
      .limit(1);

    return tag;
  }

  async getAllTags(networkId: string, q?: string) {
    return this.db
      .select()
      .from(schema.tags)
      .where(and(...this.buildReadFilters(networkId, q)))
      .orderBy(
        q ? sql`similarity(${schema.tags.name}, ${q}) DESC` : schema.tags.name,
      );
  }

  async update(id: string, tag: UpdateTagDto) {
    await this.db.update(schema.tags).set(tag).where(eq(schema.tags.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.tags).where(eq(schema.tags.id, id));
  }
}
