import { Inject, Injectable } from "@nestjs/common";
import type { CreateRuleDto } from "common/dto/rule/create-rule";
import type { UpdateRuleDto } from "common/dto/rule/update-rule";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { type Database, DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class RulesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(rule: CreateRuleDto, networkId: string) {
    await this.db.insert(schema.rules).values({ ...rule, networkId });
  }

  async get(ruleId: string) {
    return this.db.query.rules.findFirst({
      where: {
        id: ruleId,
      },
    });
  }

  async getAllRules(networkId: string) {
    return this.db.query.rules.findMany({
      where: {
        networkId,
      },
    });
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
