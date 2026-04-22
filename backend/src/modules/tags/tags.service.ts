import { Inject, Injectable } from "@nestjs/common";
import type { CreateTagDto } from "common/dto/tag/create-tag";
import type { UpdateTagDto } from "common/dto/tag/update-tag";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm/sql";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class TagsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(tag: CreateTagDto, networkId: string) {
    await this.db.insert(schema.tags).values({ ...tag, networkId });
  }

  async read(id: string) {
    return await this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.id, id));
  }

  async getAllTags(networkId: string, q: string) {
    return await this.db
      .select()
      .from(schema.tags)
      .where(
        and(
          eq(schema.tags.networkId, networkId),
          sql`${schema.tags.name} % ${q}`,
        ),
      )
      .orderBy(sql`similarity(${schema.tags.name}, ${q}) DESC`);
  }

  async update(id: string, tag: UpdateTagDto) {
    await this.db.update(schema.tags).set(tag).where(eq(schema.tags.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.tags).where(eq(schema.tags.id, id));
  }
}
