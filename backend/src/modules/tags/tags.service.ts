import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm/sql";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";
import type { Tag } from "./interfaces/tag.interface";

@Injectable()
export class TagsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(tag: Tag, networkId: string) {
    await this.db.insert(schema.tags).values({ ...tag, networkId: networkId });
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

  async update(id: string, tag: Tag) {
    await this.db.update(schema.tags).set(tag).where(eq(schema.tags.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.tags).where(eq(schema.tags.id, id));
  }
}
