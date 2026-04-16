import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";
import type { Rule } from "./interfaces/rule.interface";

@Injectable()
export class RulesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(rule: Rule, network_id: string) {
    rule.network_id = network_id;
    await this.db.insert(schema.rules).values(rule);
  }

  async get(rule_id: string) {
    return await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.id, rule_id));
  }

  async update(rule_id: string, rule: Rule) {
    await this.db
      .update(schema.rules)
      .set(rule)
      .where(eq(schema.rules.id, rule_id));
  }

  async delete(rule_id: string) {
    await this.db.delete(schema.rules).where(eq(schema.rules.id, rule_id));
  }
}
