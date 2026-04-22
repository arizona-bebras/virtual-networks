import { Inject, Injectable } from "@nestjs/common";
import { CreateRuleDto } from "common/dto/rule/create-rule";
import { UpdateRuleDto } from "common/dto/rule/update-rule";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class RulesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(rule: CreateRuleDto, networkId: string) {
    await this.db.insert(schema.rules).values({ ...rule, networkId });
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

  async update(ruleId: string, rule: UpdateRuleDto) {
    await this.db
      .update(schema.rules)
      .set(rule)
      .where(eq(schema.rules.id, ruleId));
  }

  async delete(ruleId: string) {
    await this.db.delete(schema.rules).where(eq(schema.rules.id, ruleId));
  }
}
