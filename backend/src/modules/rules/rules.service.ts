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

  async create(rule: Rule, networkId: string) {
    rule.networkId = networkId;
    await this.db.insert(schema.rules).values(rule);
  }

  async get(ruleId: string) {
    return await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.id, ruleId));
  }

  async getAllRules(networkId: string) {
    return await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.networkId, networkId));
  }

  async update(ruleId: string, rule: Rule) {
    await this.db
      .update(schema.rules)
      .set(rule)
      .where(eq(schema.rules.id, ruleId));
  }

  async delete(ruleId: string) {
    await this.db.delete(schema.rules).where(eq(schema.rules.id, ruleId));
  }
}
